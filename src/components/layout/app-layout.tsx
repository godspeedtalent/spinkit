
"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, usePathname as useNextPathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
  DesktopSidebarToggle,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "./sidebar-nav";
import { Logo } from "@/components/icons";
import { siteConfig, type ToolWindowId, type ToolDefinition } from "@/config/site";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  LogOut, SettingsIcon as SettingsIconLucide, Music as MusicIcon, 
  Code as CodeIcon, MessageSquare as ChatIcon, Pin as PinIconLucide, Search as SearchIconLucide, Globe, 
  GripVertical, Sparkles, Minus, Bell, Maximize2, 
  ChevronsLeftRight, ExternalLink, Command as CommandIcon, CalendarDays as CalendarQuickViewIcon,
  ArrowUpCircle, ArrowDownCircle // New icons for toggle button
} from "lucide-react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Breadcrumbs from "./breadcrumbs";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { allMockCityNames } from "@/data/mock-data/cities";
import { appLogger } from "@/lib/logger"; 

import { useAuthStore } from '@/stores/authStore';
import { usePinnedItemsStore } from '@/stores/pinnedItemsStore';
import { useToolWindowsStore } from '@/stores/toolWindowsStore';
import { useUserPreferencesStore } from '@/stores/userPreferencesStore';

import FocusedSearchOverlay from "@/components/shared/focused-search-overlay";
import ShortcutGuideDialog from "@/components/shared/shortcut-guide-dialog";
import CalendarQuickViewDialog from "@/components/shared/CalendarQuickViewDialog";

// Lazy load tool window components
const DevTools = React.lazy(() => import("@/components/dev/dev-tools"));
const MusicPlayerTool = React.lazy(() => import("@/components/dev/music-player-tool"));
const ChatTool = React.lazy(() => import("@/components/dev/chat-tool"));
const AiSandboxTool = React.lazy(() => import("@/components/dev/ai-sandbox-tool"));
const PinnedResourcesTool = React.lazy(() => import("@/components/dev/pinned-resources-tool"));
const NotificationsTool = React.lazy(() => import("@/components/dev/notifications-tool"));
const ConsoleOutputTool = React.lazy(() => import("@/components/dev/console-output-tool"));


function AppNameAndLogo() {
    const { state: sidebarState } = useSidebar();
    const isMobile = useIsMobile();
    const showText = sidebarState === 'expanded' || isMobile;

    return (
        <Link href="/" className={cn("flex items-center gap-2", sidebarState === 'collapsed' && !isMobile && "justify-center w-full")}>
            <Logo className="h-8 w-8 text-sidebar-primary shrink-0" />
            {showText && (
                <span className="font-bold text-lg text-sidebar-foreground whitespace-nowrap">
                    {siteConfig.name}
                </span>
            )}
        </Link>
    );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const nextPathname = useNextPathname();

  const { 
    isAuthenticated: authStoreIsAuthenticated, 
    currentUserRole, 
    login: authStoreLogin, 
    logout: authStoreLogout 
  } = useAuthStore();

  const { pinnedItems } = usePinnedItemsStore();
  const { toolStates, toggleToolWindow, unreadNotificationCount, hasNotifications: showNotificationBell } = useToolWindowsStore();
  const {
    currentCity, setCurrentCity,
    searchQuery, setSearchQuery,
    isSearchOpen, setIsSearchOpen,
    featureToggles,
    isCalendarQuickViewOpen,
    setCalendarQuickViewOpen,
    toggleCalendarQuickView,
    toolIconPosition, // Get new state
    toggleToolIconPosition // Get new action
  } = useUserPreferencesStore();

  const [mounted, setMounted] = useState(false);
  const [isShortcutGuideOpen, setIsShortcutGuideOpen] = useState(false);

  const handleCityChange = useCallback((city: string) => {
    setCurrentCity(city);
    if (city && city !== "Worldwide" && city !== "National") {
      router.push(`/city/${encodeURIComponent(city)}`);
    } else if (city === "Worldwide" || city === "National") {
      if (nextPathname.startsWith('/city/')) {
          router.push('/djs'); 
      }
    }
  }, [setCurrentCity, router, nextPathname]);

  useEffect(() => {
    setMounted(true);
    appLogger.info("AppLayout mounted, User Preferences Store Initialized.");

    if (typeof window !== 'undefined') {
      window.handleAuthSuccess = (role) => {
        authStoreLogin(role);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Removed authStoreLogin from deps as it's stable
  
  useEffect(() => {
    if (!mounted) return;

    const isAuthPage = nextPathname === "/login" || nextPathname === "/signup";

    if (authStoreIsAuthenticated) {
      if (isAuthPage) {
        router.push("/");
      }
    } else {
      if (!isAuthPage) {
        router.push("/login");
      }
    }
  }, [mounted, authStoreIsAuthenticated, nextPathname, router]);


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === '/') {
        event.preventDefault();
        setIsShortcutGuideOpen(prev => !prev);
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsSearchOpen(!isSearchOpen); // Toggle directly
      }
       if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'c') {
        event.preventDefault();
        toggleCalendarQuickView();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setIsSearchOpen, isSearchOpen, toggleCalendarQuickView]); // Add isSearchOpen to deps

  const toolDefinitions: ToolDefinition[] = [
    { id: 'dev', icon: CodeIcon, label: 'Dev Tools', component: DevTools },
    { id: 'music', icon: MusicIcon, label: 'Music Player', authRequired: true, component: MusicPlayerTool },
    { id: 'chat', icon: ChatIcon, label: 'Chat', authRequired: true, component: ChatTool },
    { id: 'aisandbox', icon: Sparkles, label: 'AI Sandbox', authRequired: true, component: AiSandboxTool },
    { id: 'pins', icon: PinIconLucide, label: 'Pinned Items', authRequired: true, component: PinnedResourcesTool },
    { id: 'notifications', icon: Bell, label: 'Notifications', authRequired: true, component: NotificationsTool },
    { id: 'consoleoutput', icon: CodeIcon, label: 'Console Output', authRequired: true, component: ConsoleOutputTool }, // Updated icon
  ];

  const visibleToolDefinitions = toolDefinitions.filter(toolDef => {
    if (toolDef.id === 'dev') return true; 
    if (!authStoreIsAuthenticated && toolDef.authRequired) return false;
    
    if (!featureToggles) return true; // If featureToggles is not yet loaded, show all (or consider default)

    if (toolDef.id === 'chat' && !featureToggles.social) return false;
    if (toolDef.id === 'music' && !featureToggles.musicPlayer) return false;
    if (toolDef.id === 'aisandbox' && !featureToggles.aiFeatures) return false;
    if (toolDef.id === 'consoleoutput' && currentUserRole !== 'Admin') return false;
    if (toolDef.id === 'notifications' && (!showNotificationBell || !featureToggles.notifications)) return false; 
    
    return true;
  });

  const expandedTools = visibleToolDefinitions.filter(tool => toolStates[tool.id]);
  const isFullScreenPage = (!authStoreIsAuthenticated && (nextPathname === "/login" || nextPathname === "/signup"));

  if (!mounted && !isFullScreenPage) {
     return (
      <div className="flex items-center justify-center h-full">
         <Logo className="h-16 w-16 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
        <div className="flex flex-col h-full w-full">
            {!isFullScreenPage ? (
            <SidebarProvider defaultOpen={!isMobile}>
                <div className="flex flex-1 w-full overflow-hidden">
                <Sidebar className="border-r">
                    <SidebarHeader className="p-4 flex justify-between items-center">
                    <AppNameAndLogo />
                    </SidebarHeader>
                    <SidebarContent className="p-2 flex-grow">
                    <SidebarNav />
                    </SidebarContent>
                    <SidebarFooter className="p-2 border-t border-sidebar-border">
                       <SidebarNav.UserAccountNav currentUserRole={currentUserRole} onLogout={() => authStoreLogout()} />
                    <div className="mt-2">
                        <DesktopSidebarToggle />
                    </div>
                    </SidebarFooter>
                </Sidebar>
                <div className="flex-1 flex flex-col h-full">
                    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-14">
                    <div className="container flex h-full max-w-screen-2xl items-center justify-between px-4">
                        <div className="flex items-center">
                        <SidebarTrigger className="md:hidden mr-2" />
                        <Breadcrumbs />
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                           <Tooltip>
                            <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground"
                                onClick={() => setIsShortcutGuideOpen(true)}
                            >
                                <CommandIcon className="mr-1.5 h-3.5 w-3.5"/> Shortcuts
                            </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom"><p>Keyboard Shortcuts (Ctrl+/)</p></TooltipContent>
                        </Tooltip>
                        {authStoreIsAuthenticated && currentUserRole === "Fan" && (
                            <Select value={currentCity} onValueChange={handleCityChange}>
                            <SelectTrigger className="w-auto h-9 text-xs border-none bg-transparent focus:ring-0 focus:ring-offset-0 hover:bg-accent hover:text-accent-foreground">
                                <Globe className="mr-1.5 h-3.5 w-3.5 text-muted-foreground"/>
                                <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                            <SelectContent className="z-[150]">
                              {allMockCityNames.map(city => (
                                <SelectItem key={city} value={city} className="text-xs">{city}</SelectItem>
                              ))}
                            </SelectContent>
                            </Select>
                        )}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setIsSearchOpen(true)}>
                                    <SearchIconLucide className="h-4 w-4" />
                                    <span className="sr-only">Open Focused Search</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom"><p>Focused Search (Ctrl+K)</p></TooltipContent>
                        </Tooltip>
                        <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                            <SearchIconLucide className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                            type="search"
                            placeholder="Search..."
                            className="w-full rounded-lg bg-muted pl-8 h-9 text-sm"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                if (e.target.value.length > 0 && !isSearchOpen) setIsSearchOpen(true);
                            }}
                            onFocus={() => {if (searchQuery.length > 0 || !isSearchOpen ) setIsSearchOpen(true);}}
                            />
                        </div>
                        </div>
                    </div>
                    </header>
                    <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
                        {children}
                    </div>
                </div>
                </div>
            </SidebarProvider>
            ) : (
            <div className="flex-1 flex flex-col">{children}</div>
            )}

            {/* Site Toolbar Icons Position Toggle Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="fixed right-4 top-[calc(theme(spacing.14)_+_1rem)] z-[101] h-8 w-8 rounded-full shadow-md bg-card/80 backdrop-blur-sm hover:bg-primary/10 hover:text-primary"
                  onClick={toggleToolIconPosition}
                  aria-label={toolIconPosition === 'top' ? "Move Toolbar to Bottom" : "Move Toolbar to Top"}
                >
                  {toolIconPosition === 'top' ? <ArrowDownCircle className="h-4 w-4" /> : <ArrowUpCircle className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>{toolIconPosition === 'top' ? "Move Toolbar to Bottom" : "Move Toolbar to Top"}</p>
              </TooltipContent>
            </Tooltip>

            {/* Collapsed Tool Icons Container */}
            <div 
              id="tool-icon-container" 
              className={cn(
                "fixed right-4 z-[100] flex flex-col",
                toolIconPosition === 'top' 
                  ? "top-[calc(theme(spacing.14)_+_theme(spacing.4)_+_2.5rem)] space-y-2" // Adjusted top to be below the new toggle button
                  : "bottom-4 space-y-2 flex-col-reverse space-y-reverse"
              )}
            >
            {visibleToolDefinitions.map(toolDef => (
                <Tooltip key={`${toolDef.id}-collapsed-icon`}>
                    <TooltipTrigger asChild>
                    <Button
                        variant={toolStates[toolDef.id] ? "default" : "outline"}
                        size="icon"
                        className={cn(
                            "shadow-lg w-10 h-10 transition-all duration-200 relative",
                            toolStates[toolDef.id]
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-card/80 backdrop-blur-sm text-foreground hover:text-primary hover:border-primary hover:shadow-[0_0_10px_hsl(var(--primary))]"
                        )}
                        onClick={() => toggleToolWindow(toolDef.id)}
                        aria-label={toolStates[toolDef.id] ? `Minimize ${toolDef.label}` : `Open ${toolDef.label}`}
                    >
                        <toolDef.icon className="h-5 w-5" />
                        {toolDef.id === 'pins' && pinnedItems.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold">
                                {pinnedItems.length > 9 ? '9+' : pinnedItems.length}
                        </span>
                        )}
                        {toolDef.id === 'notifications' && unreadNotificationCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold">
                                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                            </span>
                        )}
                    </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left"><p>{toolStates[toolDef.id] ? `Minimize ${toolDef.label}`: `Open ${toolDef.label}`}</p></TooltipContent>
                </Tooltip>
            ))}
            </div>

            {/* Expanded Tool Windows Container */}
            <div className="fixed bottom-4 right-[calc(theme(spacing.4)_+_theme(spacing.10)_+_theme(spacing.2))] z-[90] flex flex-row-reverse items-end gap-3">
                {expandedTools.map((toolDef) => (
                    <Suspense fallback={null} key={toolDef.id}>
                        <toolDef.component
                            isExpanded={toolStates[toolDef.id]}
                            onToggleExpand={() => toggleToolWindow(toolDef.id)}
                        />
                    </Suspense>
                ))}
            </div>

            <FocusedSearchOverlay />
            {mounted && <CalendarQuickViewDialog />} 
            <ShortcutGuideDialog isOpen={isShortcutGuideOpen} onOpenChange={setIsShortcutGuideOpen} />
            <Toaster />
        </div>
    </TooltipProvider>
  );
}
