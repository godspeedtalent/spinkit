
import React from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PinnedItem } from '@/config/site';
import { toast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useToolWindowsStore } from './toolWindowsStore';

const MAX_PINNED_ITEMS = 15;

interface PinnedItemsState {
  pinnedItems: PinnedItem[];
  addPinnedItem: (item: PinnedItem) => void;
  removePinnedItem: (href: string) => void;
  isItemPinned: (href: string) => boolean;
  togglePin: (item: PinnedItem) => void;
}

export const usePinnedItemsStore = create<PinnedItemsState>()(
  persist(
    (set, get) => ({
      pinnedItems: [],
      addPinnedItem: (item) => {
        const { pinnedItems } = get();

        if (pinnedItems.find(p => p.href === item.href)) {
          const actionElement = React.createElement(ToastAction, {
            altText: "View Pins",
            onClick: () => useToolWindowsStore.getState().openToolWindow('pins')
          }, "View Pins");
          toast({
            title: `Already Pinned: ${item.name}`,
            description: `${item.type} is already in your pinned items.`,
            action: actionElement,
          });
          return;
        }

        if (pinnedItems.length >= MAX_PINNED_ITEMS) {
          toast({
            title: "Pin Limit Reached",
            description: `You can only pin up to ${MAX_PINNED_ITEMS} items. Please unpin an item to add a new one.`,
            variant: "destructive",
          });
          return;
        }

        const newItems = [item, ...pinnedItems];
        set({ pinnedItems: newItems });
        
        const newPinActionElement = React.createElement(ToastAction, {
          altText: "View Pins",
          onClick: () => useToolWindowsStore.getState().openToolWindow('pins')
        }, "View Pins");

        toast({
          title: `Pinned: ${item.name}`,
          description: `${item.type} added to your pinned items.`,
          action: newPinActionElement,
        });
      },
      removePinnedItem: (href) => {
        const itemToRemove = get().pinnedItems.find(p => p.href === href);
        set((state) => ({
          pinnedItems: state.pinnedItems.filter(p => p.href !== href)
        }));
        if (itemToRemove) {
          toast({ title: "Unpinned", description: `${itemToRemove.name} removed from pins.` });
        }
      },
      isItemPinned: (href) => {
        return !!get().pinnedItems.find(p => p.href === href);
      },
      togglePin: (item: PinnedItem) => {
        if (get().isItemPinned(item.href)) {
          get().removePinnedItem(item.href);
        } else {
          get().addPinnedItem(item);
        }
      }
    }),
    {
      name: 'pinned-items-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ pinnedItems: state.pinnedItems }), // Only persist the items themselves
    }
  )
);
