
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavGroup, NavItem, UserRole } from "@/config/site";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Settings as SettingsIcon, LogOut as LogOutIcon, HomeIcon as DefaultHomeIcon,
  Hammer, Wrench, Users, UserCog, UserCircle as UserCircleIcon, MessageSquare as MessageSquareIcon, Search as SearchIcon,
  ChevronDown
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useUserPreferencesStore } from "@/stores/userPreferencesStore"; // Import user preferences store

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  setIsPageLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

interface UserAccountNavProps {
  currentUserRole: UserRole;
  onLogout: () => void;
}

const UserAccountNavComponent: React.FC<UserAccountNavProps> = ({ currentUserRole, onLogout }) => {
  const pathname = usePathname();
  const { state: sidebarCurrentState, isMobile } = useSidebar();
  const { featureToggles } = useUserPreferencesStore();

  const isUserAccountItemVisible = (itemRoles: UserRole[], itemTitle?: string) => {
    if (itemRoles.includes(currentUserRole)) return true;
    if (currentUserRole === "Guest" && itemRoles.includes("Guest")) return true;
    return false;
  };

  const userAccountItems = siteConfig.userAccountNav.filter(item => isUserAccountItemVisible(item.roles, item.title));

  return (
    <>
      {(sidebarCurrentState === 'expanded' || isMobile) && (
        <div className="px-2 py-1.5 text-xs font-semibold uppercase text-sidebar-foreground/70 tracking-wider">
          Account
        </div>
      )}
      <SidebarMenu className={cn("pt-0", sidebarCurrentState === 'collapsed' && !isMobile && "items-center")}>
        {userAccountItems.map((item) => (
          <SidebarMenuItem key={item.href} className="w-full">
            <Link href={item.href} legacyBehavior passHref>
              <SidebarMenuButton
                variant="default"
                className={cn("w-full justify-start text-sm h-9", sidebarCurrentState === 'collapsed' && !isMobile && "justify-center h-9 w-9")}
                isActive={item.exactMatch ? pathname === item.href : pathname.startsWith(item.href)}
                tooltip={item.description || item.title}
              >
                <item.icon className={cn("mr-2 h-4 w-4 flex-shrink-0", sidebarCurrentState === 'collapsed' && !isMobile && "mr-0")} />
                {(sidebarCurrentState === 'expanded' || isMobile) && <span className="truncate">{item.title}</span>}
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
        {currentUserRole !== "Guest" && (
          <SidebarMenuItem className="w-full">
            <SidebarMenuButton
              variant="default"
              className={cn("w-full justify-start text-sm h-9 text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10", sidebarCurrentState === 'collapsed' && !isMobile && "justify-center h-9 w-9")}
              onClick={onLogout}
              tooltip="Log Out"
            >
              <LogOutIcon className={cn("mr-2 h-4 w-4 flex-shrink-0", sidebarCurrentState === 'collapsed' && !isMobile && "mr-0")} />
              {(sidebarCurrentState === 'expanded' || isMobile) && <span className="truncate">Log Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </>
  );
};
SidebarNav.UserAccountNav = UserAccountNavComponent;

export function SidebarNav({ className, setIsPageLoading, ...props }: SidebarNavProps) {
  const pathname = usePathname();
  const { state: sidebarCurrentState, isMobile } = useSidebar();
  const { currentUserRole } = useAuthStore();
  const { featureToggles } = useUserPreferencesStore();
  const [openPopoverGroup, setOpenPopoverGroup] = React.useState<string | null>(null);

  const isNavItemVisible = (itemRoles: UserRole[], itemTitle?: string) => {
    // Specific feature toggle checks
    if (itemTitle === "Profile" && (!featureToggles || !featureToggles.social)) return false;
    if (itemTitle === "Messaging" && (!featureToggles || !featureToggles.social)) return false;
    
    // Role checks
    if (itemRoles.includes(currentUserRole)) return true;
    if (currentUserRole === "Guest" && itemRoles.includes("Guest")) return true; // Allow guest access to guest-marked items
    if (currentUserRole !== "Guest" && itemRoles.includes("Guest") && !itemRoles.some(r => r !== "Guest")) return false; // If logged in, don't show guest-only items
    return false;
  };

  const isNavGroupVisible = (group: NavGroup) => {
    if (group.groupTitle === "Discovery" && featureToggles && !featureToggles.discovery) return false;
    if (group.groupTitle === "Social" && featureToggles && !featureToggles.social) return false;
    if (group.groupTitle === "Transactions" && featureToggles && !featureToggles.transactions) return false;

    // Check if group itself is role-visible
    if (!group.roles.includes(currentUserRole) && !(currentUserRole === "Guest" && group.roles.includes("Guest"))) {
      return false;
    }
    // Check if any item within the group is visible
    return group.items.some(item => isNavItemVisible(item.roles, item.title));
  };

  const navGroups = React.useMemo(() => {
    return siteConfig.mainNav
      .filter(isNavGroupVisible)
      .map(group => {
        const filteredItems = group.items.filter(item => isNavItemVisible(item.roles, item.title));
        const subGroups: Record<string, NavItem[]> = {};
        const directItems: NavItem[] = [];
        filteredItems.forEach(item => {
          if (item.isSubGroupItem && item.subGroupTitle) {
            if (!subGroups[item.subGroupTitle]) subGroups[item.subGroupTitle] = [];
            subGroups[item.subGroupTitle].push(item);
          } else {
            directItems.push(item);
          }
        });
        return { ...group, items: filteredItems, subGroups, directItems };
      })
      .filter(og => (og.directItems && og.directItems.length > 0) || (og.subGroups && Object.keys(og.subGroups).length > 0));
  }, [currentUserRole, featureToggles]);


  const getSubGroupIcon = (subGroupTitle: string | undefined) => {
    if (subGroupTitle === "Tools") return Hammer;
    if (subGroupTitle === "Onboarding") return UserCog;
    // Add more specific icons as needed
    return Wrench; // Default subgroup icon
  };

  const [openAccordionGroups, setOpenAccordionGroups] = React.useState<string[]>(() =>
    navGroups.filter(g => g.defaultOpen).map(g => g.groupTitle)
  );
  
  const [openSubgroupAccordionItems, setOpenSubgroupAccordionItems] = React.useState<Record<string, string | undefined>>(() => {
    const initial: Record<string, string | undefined> = {};
    navGroups.forEach(group => {
      if (openAccordionGroups.includes(group.groupTitle) && group.subGroups) {
        Object.keys(group.subGroups).forEach(sgTitle => {
          if(group.subGroups && group.subGroups[sgTitle].length > 0) {
             initial[`${group.groupTitle}_${sgTitle}`] = sgTitle; 
          }
        });
      }
    });
    return initial;
  });

  const handleTopLevelAccordionChange = (value: string[]) => {
    setOpenAccordionGroups(value);
    const newSubgroupStates = { ...openSubgroupAccordionItems };
    navGroups.forEach(group => {
      if (group.subGroups) {
        Object.keys(group.subGroups).forEach(sgTitle => {
          const key = `${group.groupTitle}_${sgTitle}`;
          if(group.subGroups && group.subGroups[sgTitle].length > 0) {
            newSubgroupStates[key] = value.includes(group.groupTitle) ? sgTitle : undefined;
          }
        });
      }
    });
    setOpenSubgroupAccordionItems(newSubgroupStates);
  };

  const handleSubgroupAccordionChange = (parentGroupTitle: string, subGroupTitle: string, newValue: string | undefined) => {
    setOpenSubgroupAccordionItems(prev => ({
      ...prev,
      [`${parentGroupTitle}_${subGroupTitle}`]: newValue,
    }));
  };
  
  const renderNavItems = (items: NavItem[], isSubItem: boolean = false, isPopover: boolean = false) => (
    items.filter(item => { // Filter based on feature toggles here as well
      if (item.title === "Profile" && (!featureToggles || !featureToggles.social)) return false;
      if (item.title === "Messaging" && (!featureToggles || !featureToggles.social)) return false;
      return true;
    }).map((item) => (
      <SidebarMenuItem key={item.href} className={cn(!isPopover && "w-full")}>
        <Link href={item.href} legacyBehavior passHref>
          <SidebarMenuButton
            variant={isPopover ? "ghost" : "default"}
            className={cn(
              "w-full justify-start",
              isSubItem && !isPopover && "text-xs h-7",
              !isSubItem && !isPopover && "text-sm h-9 px-2 py-2",
              isPopover && "text-sm h-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isPopover && isSubItem && "pl-4 text-sm h-8"
            )}
            isActive={item.exactMatch ? pathname === item.href : pathname.startsWith(item.href)}
            tooltip={item.description || item.title}
            onClick={() => setIsPageLoading(true)}
          >
            {!isPopover && item.icon && <item.icon className={cn("mr-2 flex-shrink-0", isSubItem ? "h-3.5 w-3.5" : "h-4 w-4")} />}
            {(sidebarCurrentState === 'expanded' || isMobile || isPopover) && <span className="truncate">{item.title}</span>}
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    ))
  );
  
  if (sidebarCurrentState === 'expanded' || isMobile) {
    return (
      <nav className={cn("flex flex-col space-y-0.5", className)} {...props}>
       {navGroups.map((group) => {
          if (group.groupTitle === "Home" && group.directItems.length > 0) {
            return (
                <SidebarMenu key="home-direct-items" className="space-y-0.5">
                    {renderNavItems(group.directItems, false, false)}
                </SidebarMenu>
            );
          }

          const GroupIcon = group.groupIcon || DefaultHomeIcon;
          const visibleDirectItems = group.directItems;
          const visibleSubGroups = group.subGroups ? Object.entries(group.subGroups)
            .map(([sgTitle, sgItems]) => ({ title: sgTitle, items: sgItems }))
            .filter(sg => sg.items.length > 0) : [];
          
          if (visibleDirectItems?.length === 0 && visibleSubGroups.length === 0) return null;

          return (
            <Accordion
                type="multiple"
                value={openAccordionGroups}
                onValueChange={handleTopLevelAccordionChange}
                className="w-full"
                key={group.groupTitle}
            >
                <AccordionItem value={group.groupTitle} className="border-b-0">
                    <AccordionTrigger 
                        className="py-2 px-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md hover:no-underline"
                    >
                    <div className="flex items-center gap-2">
                        <GroupIcon className="h-4 w-4" />
                        <span>{group.groupTitle}</span>
                    </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-0 pt-1">
                    <SidebarMenu className="ml-0 pl-2 border-l border-sidebar-border/50 space-y-0.5">
                        {visibleDirectItems && renderNavItems(visibleDirectItems)}
                        {visibleSubGroups.sort((a,b) => a.title.localeCompare(b.title)).map((subGroup) => {
                        const subGroupItems = subGroup.items;
                        const SubGroupIcon = getSubGroupIcon(subGroup.title);
                        const subgroupKey = `${group.groupTitle}_${subGroup.title}`;
                        return (
                            <Accordion
                            key={subgroupKey}
                            type="single"
                            collapsible
                            className="w-full pl-2 mt-1"
                            value={openSubgroupAccordionItems[subgroupKey]}
                            onValueChange={(val) => handleSubgroupAccordionChange(group.groupTitle, subGroup.title, val)}
                            >
                            <AccordionItem value={subGroup.title} className="border-b-0">
                                <AccordionTrigger className="py-1.5 px-1 text-xs font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground rounded-md hover:no-underline [&[data-state=open]>svg]:text-sidebar-primary">
                                <div className="flex items-center gap-1.5">
                                    <SubGroupIcon className="h-3.5 w-3.5" />
                                    <span>{subGroup.title}</span>
                                </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-0 pt-0.5">
                                <SidebarMenu className="ml-0 pl-2 border-l border-sidebar-border/30 space-y-0.5">
                                    {renderNavItems(subGroupItems, true)}
                                </SidebarMenu>
                                </AccordionContent>
                            </AccordionItem>
                            </Accordion>
                        );
                        })}
                    </SidebarMenu>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
          );
        })}
      </nav>
    );
  }

  // Collapsed Desktop View
  return (
    <nav className={cn("flex flex-col items-center space-y-1", className)} {...props}>
      {navGroups.map((group) => {
        const GroupIcon = group.groupIcon || DefaultHomeIcon;
        const isGroupActive = group.items.some(item => item.exactMatch ? pathname === item.href : pathname.startsWith(item.href));

        if (group.groupTitle === "Home" && group.directItems.length > 0) {
            return group.directItems.map(homeItem => (
                <SidebarMenuItem key={homeItem.href + "-collapsed"} className="w-full">
                    <Link href={homeItem.href} legacyBehavior passHref>
                        <SidebarMenuButton
                        variant="default"
                        className="justify-center h-9 w-9"
                        isActive={homeItem.exactMatch ? pathname === homeItem.href : pathname.startsWith(homeItem.href)}
                        tooltip={homeItem.description || homeItem.title}
                        >
                        <homeItem.icon className="h-5 w-5" />
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            ));
        }
        
        const visibleDirectItems = group.directItems;
        const visibleSubGroups = group.subGroups ? Object.entries(group.subGroups)
            .map(([sgTitle, sgItems]) => ({ title: sgTitle, items: sgItems }))
            .filter(sg => sg.items.length > 0) : [];

        if (visibleDirectItems?.length === 0 && visibleSubGroups.length === 0) {
            return null;
        }

        return (
          <Popover
            key={group.groupTitle + "-collapsed"}
            open={openPopoverGroup === group.groupTitle}
            onOpenChange={(isOpen) => setOpenPopoverGroup(isOpen ? group.groupTitle : null)}
          >
            <PopoverTrigger asChild>
              <SidebarMenuButton
                variant="default"
                className={cn("justify-center h-9 w-9 w-full", isGroupActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90")}
                tooltip={group.description || group.groupTitle}
                onMouseEnter={() => setOpenPopoverGroup(group.groupTitle)}
              >
                <GroupIcon className="h-5 w-5" />
              </SidebarMenuButton>
            </PopoverTrigger>
            <PopoverContent
              side="right"
              align="start"
              className="ml-2 p-1 min-w-[180px] bg-sidebar text-sidebar-foreground border-sidebar-border shadow-lg z-[60]"
              onMouseLeave={() => setOpenPopoverGroup(null)}
              onMouseEnter={() => setOpenPopoverGroup(group.groupTitle)}
            >
              <div className="p-2 text-xs font-semibold text-sidebar-foreground/80 border-b border-sidebar-border/50 mb-1">{group.groupTitle}</div>
              <SidebarMenu className="space-y-0.5">
                {visibleDirectItems && renderNavItems(visibleDirectItems, false, true)}
                {visibleSubGroups.sort((a,b) => a.title.localeCompare(b.title)).map((subGroup) => {
                  const SubGroupIcon = getSubGroupIcon(subGroup.title);
                  return (
                    <React.Fragment key={subGroup.title + "-pop"}>
                      <div className="px-2 pt-2 pb-1 text-xs font-semibold text-sidebar-foreground/70 flex items-center">
                        <SubGroupIcon className="mr-1.5 h-3.5 w-3.5" /> {subGroup.title}
                      </div>
                      {renderNavItems(subGroup.items, true, true)}
                    </React.Fragment>
                  );
                })}
              </SidebarMenu>
            </PopoverContent>
          </Popover>
        );
      })}
    </nav>
  );
}
