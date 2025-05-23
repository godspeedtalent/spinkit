
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface AdminSettingsNavItem {
  id: string;
  label: string;
  icon: React.ElementType; // LucideIcon
  component?: React.ReactNode; // Made optional, as children will render content
  disabled?: boolean;
}

export interface AdminSettingsNavSectionGroup {
  title: string;
  icon: React.ElementType; // LucideIcon
  items: AdminSettingsNavItem[];
}

interface AdminSettingsLayoutProps {
  pageTitle: string;
  pageIcon: React.ElementType; // LucideIcon
  navConfig: AdminSettingsNavSectionGroup[];
  activeSectionId: string;
  setActiveSectionId: (id: string) => void;
  children: React.ReactNode; // To render the active section's component
}

interface NavLinkProps {
  label: string;
  sectionId: string;
  activeSectionId: string;
  setActiveSectionId: (id: string) => void;
  icon: React.ElementType;
  disabled?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ label, sectionId, activeSectionId, setActiveSectionId, icon: Icon, disabled }) => {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start text-sm py-2.5", // Reduced padding from py-4 to py-2.5
        activeSectionId === sectionId && "bg-accent text-accent-foreground font-semibold",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={() => !disabled && setActiveSectionId(sectionId)}
      disabled={disabled}
    >
      <Icon className="mr-2.5 h-4 w-4" /> {/* Reduced margin from mr-3 */}
      {label}
    </Button>
  );
};

export default function AdminSettingsLayout({
  pageTitle,
  pageIcon: PageIcon,
  navConfig,
  activeSectionId,
  setActiveSectionId,
  children, // Active section component passed as children
}: AdminSettingsLayoutProps) {

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full"> {/* Reduced gap from gap-6 */}
      <nav className="md:w-64 lg:w-72 shrink-0 md:border-r md:pr-4 space-y-0"> {/* Reduced pr from pr-6 and space-y */}
        <h2 className="text-xl font-semibold tracking-tight mb-3 px-2 flex items-center"> {/* Reduced mb from mb-4 and text-2xl to text-xl */}
          <PageIcon className="mr-2.5 h-5 w-5 text-primary" /> {pageTitle} {/* Reduced icon margin */}
        </h2>
        {navConfig.map((group) => (
          <div key={group.title} className="mb-2"> {/* Reduced mb from mb-3 */}
            <h3 className="text-xs font-semibold text-muted-foreground px-2.5 py-1 flex items-center uppercase tracking-wider"> {/* Reduced padding and text size */}
              <group.icon className="mr-2 h-3.5 w-3.5" /> {group.title}
            </h3>
            <div className="space-y-0"> {/* Reduced space-y from space-y-0.5 */}
              {group.items.map((item) => (
                <NavLink
                  key={item.id}
                  label={item.label}
                  sectionId={item.id}
                  activeSectionId={activeSectionId}
                  setActiveSectionId={setActiveSectionId}
                  icon={item.icon}
                  disabled={item.disabled}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}
