
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ToolWindowWrapper from "@/components/shared/tool-window-wrapper";
import { useToolWindowsStore } from "@/stores/toolWindowsStore";

interface NotificationsToolProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const mockNotificationsData = [
  { id: "n1", title: "New Gig Offer", message: "Venue 'The Groove Lounge' sent you a booking request for next Friday.", time: "10m ago", read: false },
  { id: "n2", title: "Payment Received", message: "Payment of $250 from 'Sunset Soul Session' has been processed.", time: "1h ago", read: false },
  { id: "n3", title: "Profile Tip", message: "Consider adding a new mix to your profile to attract more venues.", time: "3h ago", read: true },
  { id: "n4", title: "Message from DJ Sparkle", message: "Hey, are you available for a collab next month?", time: "1d ago", read: true },
];

export default function NotificationsTool({ isExpanded, onToggleExpand }: NotificationsToolProps) {
  const [mounted, setMounted] = React.useState(false);
  // Internal state for managing read status of demo notifications
  const [localNotifications, setLocalNotifications] = React.useState(mockNotificationsData);
  
  const { unreadNotificationCount, setUnreadNotificationCount, decrementUnreadCount } = useToolWindowsStore();

  React.useEffect(() => setMounted(true), []);

  // Sync local unread count with store on mount if needed, though store is primary
  React.useEffect(() => {
    const unread = localNotifications.filter(n => !n.read).length;
    if (unread !== unreadNotificationCount) {
      setUnreadNotificationCount(unread);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localNotifications, setUnreadNotificationCount]);


  if (!mounted) return null;
  if (!isExpanded) return null;

  const handleMarkAsRead = (id: string) => {
    const notification = localNotifications.find(n => n.id === id);
    if (notification && !notification.read) {
      setLocalNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      decrementUnreadCount();
    }
  };
  
  const handleMarkAllRead = () => {
    setLocalNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadNotificationCount(0);
  };

  const currentUnreadCount = localNotifications.filter(n => !n.read).length;
  const titleWithCount = `Notifications ${currentUnreadCount > 0 ? `(${currentUnreadCount})` : ''}`;

  const toolSpecificHeaderActions = currentUnreadCount > 0 ? (
    <span className="ml-1.5 text-xs bg-blue-500 text-white rounded-full px-1.5 py-0.5">{currentUnreadCount}</span>
  ) : null;


  return (
    <ToolWindowWrapper
      title={titleWithCount}
      icon={Bell}
      onToggleExpand={onToggleExpand}
      className="w-80 h-[400px] border-blue-500/50"
      headerClassName="border-blue-500/30"
      titleClassName="text-blue-600 dark:text-blue-400"
      contentClassName="p-0 flex flex-col" 
      toolSpecificHeaderActions={toolSpecificHeaderActions}
    >
      {localNotifications.length > 0 ? (
          <>
          <ScrollArea className="flex-1 p-2">
              <div className="space-y-2">
              {localNotifications.map(notif => (
                  <div key={notif.id} className={`p-2 rounded-md ${notif.read ? 'bg-muted/30 opacity-70' : 'bg-blue-500/10 border border-blue-500/30'}`}>
                  <div className="flex justify-between items-start">
                      <h4 className={`text-xs font-semibold ${notif.read ? 'text-muted-foreground' : 'text-blue-700 dark:text-blue-300'}`}>{notif.title}</h4>
                      {!notif.read && (
                          <Button variant="ghost" size="icon" className="h-5 w-5 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20" onClick={() => handleMarkAsRead(notif.id)} title="Mark as read">
                              <CheckCircle className="h-3 w-3"/>
                          </Button>
                      )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
                  <p className="text-xs text-muted-foreground/70 text-right mt-1">{notif.time}</p>
                  </div>
              ))}
              </div>
          </ScrollArea>
          {currentUnreadCount > 0 && (
              <div className="p-2 border-t border-blue-500/30">
                  <Button variant="outline" size="sm" className="w-full text-xs" onClick={handleMarkAllRead}>Mark All as Read</Button>
              </div>
          )}
          </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-3">
          <Bell className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No new notifications.</p>
        </div>
      )}
    </ToolWindowWrapper>
  );
}
