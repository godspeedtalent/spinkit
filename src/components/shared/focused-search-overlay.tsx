
"use client";

import React, { useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Search as SearchIconLucide } from 'lucide-react'; 
import Link from 'next/link';
import PlaceholderImage from './placeholder-image';
import { useUserPreferencesStore } from '@/stores/userPreferencesStore';
import { siteConfig } from '@/config/site'; 
import { cn } from '@/lib/utils';

const mockSearchItems = [
  { groupTitle: "Artists", items: [{label: "DJ Sparkle", href: "/djs/1", imageUrl: "dj-sparkle.png", aiHint:"dj party"}, {label: "Groove Master G", href: "/djs/2", imageUrl: "dj-groove.png", aiHint:"dj concert"}, {label: "Beatrix Kiddo", href: "/djs/3", imageUrl: "dj-beatrix.png", aiHint:"dj stage"}] },
  { groupTitle: "Venues", items: [{label: "The Groove Lounge", href: "/venues/1", imageUrl: "venue-lounge.png", aiHint:"club interior"}, {label: "Skyline Rooftop Bar", href: "/venues/2", imageUrl: "venue-rooftop.png", aiHint:"rooftop bar"}, {label: "The Warehouse Project", href: "/venues/3", imageUrl: "venue-warehouse.png", aiHint:"industrial venue"}] },
  { groupTitle: "Recordings", items: [{label: "Midnight Drive", href: "/recordings/rec-sparkle-1", imageUrl: "recording-midnight.png", aiHint:"abstract cityscape"}, {label: "Funkadelic Flow Vol. 1", href: "/recordings/rec-groove-1", imageUrl: "recording-funk.png", aiHint:"vinyl record"}, {label: "Future Soundscapes", href: "/recordings/rec-beatrix-1", imageUrl: "recording-future.png", aiHint:"sound waves"}] },
  { groupTitle: "Events", items: [{label: "Deep Grooves Night", href: "/events#evt1", imageUrl: "event-deep-grooves.png", aiHint:"nightclub lights"}, {label: "Sunset Soul Session", href: "/events#evt2", imageUrl: "event-sunset.png", aiHint:"beach sunset party"}] },
  { groupTitle: "Genres", items: [{label: "Techno", href: "/genres/Techno", imageUrl: "genre-techno.png", aiHint:"techno pattern"}, {label: "House", href: "/genres/House", imageUrl: "genre-house.png", aiHint:"house music equalizer"}, {label: "Funk", href: "/genres/Funk", imageUrl: "genre-funk.png", aiHint:"funkadelic design"}]},
  { groupTitle: "Pages", items: [{label: "Payments", href: "/payments"}, {label: "Settings", href: "/settings"}, {label: "Messaging", href: "/messages"}] },
  { groupTitle: "Cities", items: [{label: "Metro City", href: "/city/Metro%20City", imageUrl: "city-metro.png", aiHint:"futuristic city"}, {label: "New York", href: "/city/New%20York", imageUrl: "city-new-york.png", aiHint:"new york skyline"}, {label: "Berlin", href: "/city/Berlin", imageUrl: "city-berlin.png", aiHint:"berlin wall art"}] },
];


export default function FocusedSearchOverlay() {
  const { searchQuery, setSearchQuery, isSearchOpen, setIsSearchOpen } = useUserPreferencesStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      if (document.activeElement !== inputRef.current) {
        setTimeout(() => {
          if (inputRef.current) { 
             inputRef.current.focus();
          }
        }, 0);
      }
    }
  }, [isSearchOpen, searchQuery]); 

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isSearchOpen, setIsSearchOpen]);

  const filteredSearchItems = useMemo(() => {
    if (!searchQuery) return [];
    return mockSearchItems
      .map(group => ({
        ...group,
        items: group.items.filter(item =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter(group => group.items.length > 0);
  }, [searchQuery]);

  if (!isSearchOpen) {
    return null;
  }

  const handleClose = () => {
    setIsSearchOpen(false);
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in-0"
      onClick={(e) => {
        if (overlayRef.current === e.target) {
          handleClose(); 
        }
      }}
    >
      <div 
        className="relative bg-background rounded-lg w-11/12 max-w-3xl h-auto max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Search Input Area (Fixed Header) */}
        <div className="flex items-center border-b pr-2 shrink-0">
          <SearchIconLucide className="h-6 w-6 text-muted-foreground ml-4 shrink-0" />
          <Input
            ref={inputRef}
            placeholder="Search artists, venues, recordings, events..."
            className="w-full h-16 text-xl pl-3 pr-4 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant="ghost" size="icon" onClick={handleClose} className="h-10 w-10 rounded-full">
            <X className="h-5 w-5" />
            <span className="sr-only">Close search</span>
          </Button>
        </div>

        {/* Scrollable Results Area */}
        <ScrollArea className="flex-grow">
          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
            {searchQuery && filteredSearchItems.length === 0 && (
              <p className="text-muted-foreground text-center py-8 md:col-span-2">No results found for &quot;{searchQuery}&quot;.</p>
            )}
            {filteredSearchItems.map(group => (
              <section key={group.groupTitle}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">{group.groupTitle}</h3>
                <ul className="space-y-1">
                  {group.items.map(item => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={handleClose}
                        className="flex items-center gap-3 p-2.5 rounded-md hover:bg-accent transition-colors group"
                      >
                        {item.imageUrl && (
                           <PlaceholderImage
                            className="w-10 h-10 rounded-md shrink-0 object-cover"
                            seed={item.imageUrl || item.aiHint || item.label}
                            ariaLabel={item.label}
                          />
                        )}
                        <span className="text-sm text-foreground group-hover:text-accent-foreground truncate">{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
             {!searchQuery && (
                <div className="text-center py-10 text-muted-foreground md:col-span-2">
                    <SearchIconLucide className="mx-auto h-12 w-12 opacity-30 mb-3"/>
                    <p>Start typing to search across {siteConfig.name}.</p>
                </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

