
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, Users, Building2, CalendarClock, BarChart3, CreditCard, Disc3, Briefcase, Settings as SettingsIcon,
  UserCircle, HomeIcon, Music, MessageSquare, MapPin, Pin as PinIconLucide, Sparkles, Bell,
  Building, Ticket, Tags, Landmark, Hammer, Database, UserCog, Activity,
  Users2 as Users2Icon, Settings2 as AdminSettingsIcon, Search as SearchIcon, MicVocal, ListFilter, CalendarDays, Code, FileText, ServerCog, Wrench, SlidersHorizontal, ClipboardList,
  CalendarCheck, Power, Edit3, Trash2, UploadCloud, DownloadCloud, History, Terminal, MessageSquarePlus,
} from "lucide-react";

export type UserRole = "Buyer" | "Artist" | "Fan" | "Admin" | "Guest";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
  roles: UserRole[];
  exactMatch?: boolean;
  label?: string;
  description?: string;
  isSubGroupItem?: boolean;
  subGroupTitle?: string;
}

export interface NavGroup {
  groupTitle: string;
  groupIcon?: LucideIcon;
  roles: UserRole[];
  items: NavItem[];
  defaultOpen?: boolean;
  description?: string;
}

export type SiteConfig = {
  name: string;
  description: string;
  mainNav: NavGroup[];
  userAccountNav: NavItem[];
};

const ADMIN_ONLY: UserRole[] = ["Admin"];
const ARTIST_ONLY: UserRole[] = ["Artist"];
const BUYER_ONLY: UserRole[] = ["Buyer"];
const FAN_ONLY: UserRole[] = ["Fan"];

const ALL_AUTHENTICATED_ROLES: UserRole[] = ["Buyer", "Artist", "Fan", "Admin"];
const BUYER_ARTIST_ROLES: UserRole[] = ["Buyer", "Artist"];
const BUYER_ADMIN_ROLES: UserRole[] = ["Buyer", "Admin"];
const ARTIST_ADMIN_ROLES: UserRole[] = ["Artist", "Admin"];
const BUYER_ARTIST_ADMIN_ROLES: UserRole[] = ["Buyer", "Artist", "Admin"];
const FAN_ADMIN_ROLES: UserRole[] = ["Fan", "Admin"];
const FAN_BUYER_ADMIN_ROLES: UserRole[] = ["Fan", "Buyer", "Admin"];


export const siteConfig: SiteConfig = {
  name: "SpinKit",
  description: "Connecting Venues with the Perfect DJs.",
  mainNav: [
    {
      groupTitle: "Home",
      groupIcon: HomeIcon,
      roles: ALL_AUTHENTICATED_ROLES,
      defaultOpen: true,
      description: "Main application dashboard and core user functions.",
      items: [
        { title: "Home", href: "/", icon: HomeIcon, roles: ALL_AUTHENTICATED_ROLES, exactMatch: true, label: "Home Dashboard", description: "View your personalized dashboard." },
        { title: "Profile", href: "/profile", icon: UserCircle, roles: ALL_AUTHENTICATED_ROLES, label: "My Profile", description: "View and manage your public profile." },
        { title: "Messaging", href: "/messages", icon: MessageSquare, roles: ALL_AUTHENTICATED_ROLES, label: "Messages", description: "Access your inbox and chat with other users." },
      ].sort((a,b) => a.title.localeCompare(b.title)),
    },
    {
      groupTitle: "Admin Panel",
      groupIcon: AdminSettingsIcon,
      roles: ADMIN_ONLY,
      description: "Manage system settings, data, and customer tools.",
      items: [
        { title: "Customers", href: "/admin/customer-tools", icon: UserCog, roles: ADMIN_ONLY, label: "Customers", description: "Tools for managing DJ and Venue onboarding." },
        { title: "Data", href: "/admin/data-tools", icon: Database, roles: ADMIN_ONLY, label: "Data", description: "Manage database connections and data migration tasks." },
        { title: "System Config", href: "/admin/system-config", icon: SettingsIcon, roles: ADMIN_ONLY, label: "System Configuration", description: "Configure global system parameters and developer tools." },
      ].sort((a,b) => a.title.localeCompare(b.title)),
    },
     {
      groupTitle: "Gigs",
      groupIcon: CalendarClock,
      roles: BUYER_ARTIST_ROLES,
      defaultOpen: false,
      description: "Manage and discover gigs and schedules.",
      items: [
        { title: "Availability", href: "/gigs/availability", icon: CalendarCheck, roles: ARTIST_ADMIN_ROLES, label: "Manage Availability", description: "Manage your gig availability, rates, and preferences." },
        { title: "Bookings", href: "/bookings", icon: Briefcase, roles: BUYER_ARTIST_ROLES, label: "Manage Bookings", description: "Manage your gig bookings and requests." },
        { title: "Gig Board", href: "/gigs/board", icon: ClipboardList, roles: ARTIST_ONLY, label: "Gig Board", description: "Discover available gigs posted by venues." },
        { title: "Smart Scheduling", href: "/scheduling", icon: CalendarDays, roles: BUYER_ADMIN_ROLES, label: "Event Scheduler", description: "Interactive tool for scheduling artists and events." },
      ].sort((a, b) => a.title.localeCompare(b.title)),
    },
    {
      groupTitle: "Tools",
      groupIcon: Hammer,
      roles: ARTIST_ONLY,
      defaultOpen: false,
      description: "Tools to help artists manage their career.",
      items: [
        { title: "Artist Configuration", href: "/tools/artist-config", icon: SlidersHorizontal, roles: ARTIST_ADMIN_ROLES, label: "Artist Configuration", description: "Configure your specific artist settings and preferences." },
      ].sort((a, b) => a.title.localeCompare(b.title)),
    },
    {
      groupTitle: "Transactions",
      groupIcon: CreditCard,
      roles: BUYER_ARTIST_ADMIN_ROLES,
      defaultOpen: false,
      description: "Manage your payments and financial information.",
      items: [
        { title: "Link Bank Account", href: "/payments/link-bank", icon: Landmark, roles: BUYER_ARTIST_ADMIN_ROLES, label: "Banking Information", description: "Securely link your bank account for payouts." },
        { title: "Payments", href: "/payments", icon: CreditCard, roles: BUYER_ARTIST_ADMIN_ROLES, label: "Transaction History", description: "View and manage your transaction history." },
      ].sort((a,b) => a.title.localeCompare(b.title)),
    },
    {
      groupTitle: "Venue Tools",
      groupIcon: Building,
      roles: BUYER_ONLY,
      defaultOpen: false,
      description: "Manage your venue's operations and bookings.",
      items: [
        { title: "Analytics", href: "/venue/analytics", icon: BarChart3, roles: BUYER_ONLY, label: "Venue Analytics", description: "View performance data and insights for your venue." },
        { title: "Team Management", href: "/venue/team", icon: Users2Icon, roles: BUYER_ONLY, label: "Venue Team", description: "Manage your venue's team members and roles." },
        { title: "Venue Settings", href: "/venue/settings", icon: SettingsIcon, roles: BUYER_ONLY, label: "Edit Venue Settings", description: "Configure specific settings for your venue." },
      ].sort((a, b) => a.title.localeCompare(b.title)),
    },
    { 
      groupTitle: "Discovery",
      groupIcon: SearchIcon,
      roles: ALL_AUTHENTICATED_ROLES, 
      defaultOpen: false,
      description: "Explore artists, venues, recordings, events, and genres.",
      items: [
        { title: "Artists", href: "/djs", icon: Disc3, roles: ALL_AUTHENTICATED_ROLES, label: "Browse Artists", description: "Discover and browse artist profiles." },
        { title: "Browse Events", href: "/events", icon: Ticket, roles: ALL_AUTHENTICATED_ROLES, label: "Find Events", description: "Find upcoming events and gigs." }, 
        { title: "Genres", href: "/genres", icon: Tags, roles: ALL_AUTHENTICATED_ROLES, label: "Explore Genres", description: "Explore different music genres and related content." }, 
        { title: "Recordings", href: "/recordings", icon: Music, roles: ALL_AUTHENTICATED_ROLES, label: "Discover Music", description: "Listen to and discover new music recordings."},
        { title: "Venues", href: "/venues", icon: Building2, roles: ALL_AUTHENTICATED_ROLES, label: "Find Venues", description: "Explore and find venues for events." },
      ].sort((a, b) => a.title.localeCompare(b.title)),
    },
  ].sort((a,b) => {
    const preferredOrder = ["Home", "Admin Panel", "Social", "Tools", "Venue Tools", "Gigs", "Transactions", "Discovery"];
    const aIndex = preferredOrder.indexOf(a.groupTitle);
    const bIndex = preferredOrder.indexOf(b.groupTitle);

    if (a.groupTitle === "Home") return -Infinity; 
    if (b.groupTitle === "Home") return Infinity;
    if (a.groupTitle === "Admin Panel" && b.groupTitle !== "Home") return -1;
    if (b.groupTitle === "Admin Panel" && a.groupTitle !== "Home") return 1;
    
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.groupTitle.localeCompare(b.groupTitle);
  }),
  userAccountNav: [
    { title: "Settings", href: "/settings", icon: SettingsIcon, roles: ALL_AUTHENTICATED_ROLES, label: "Account Settings", description: "Manage your account settings, notifications, and preferences." },
  ]
};

export type PinnedItemType = "DJ" | "Venue" | "Recording" | "Event" | "Genre" | "Chat" | "City" | "Transaction";

export interface PinnedItem {
  type: PinnedItemType;
  name: string;
  href: string;
  imageUrl?: string; 
  aiHint?: string;
}

export type ToolWindowId = "dev" | "music" | "chat" | "aisandbox" | "pins" | "notifications" | "consoleoutput";

export interface ToolDefinition {
  id: ToolWindowId;
  icon: LucideIcon;
  label: string;
  color?: string;
  authRequired?: boolean;
  component: React.LazyExoticComponent<React.ComponentType<any>>; 
  defaultExpanded?: boolean;
}
