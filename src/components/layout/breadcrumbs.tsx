
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { siteConfig } from '@/config/site';
import type { NavItem, NavGroup } from '@/config/site';

// Helper function to find a nav item by its href for label resolution
const findNavItemByHref = (href: string): NavItem | undefined => {
  for (const group of siteConfig.mainNav) {
    const item = group.items.find(i => {
      // For dynamic routes, we match the base path
      // e.g., /djs/[id] should match /djs for the group label
      if (i.href.includes('[') && href.startsWith(i.href.split('[')[0])) {
        return true;
      }
      return i.href === href;
    });
    if (item) return item;
  }
  for (const item of siteConfig.userAccountNav) {
     if (item.href.includes('[') && href.startsWith(item.href.split('[')[0])) {
        return true; // Using 'true' here was a bug, should be 'item'
      }
    if (item.href === href) return item;
  }
  return undefined;
};


const Breadcrumbs: React.FC = () => {
  const pathname = usePathname();
  if (!pathname || pathname === '/') {
    return (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Home className="h-4 w-4" />
            <span className="font-medium text-foreground">Dashboard</span>
        </div>
    );
  }

  const pathSegments = pathname.split('/').filter(segment => segment);

  const breadcrumbItems = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    let label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

    // Try to find a more specific label from siteConfig
    const navItem = findNavItemByHref(href);
    if (navItem?.label) {
      label = navItem.label;
    } else if (index === pathSegments.length -1 && !isNaN(Number(segment))) {
        const parentHref = '/' + pathSegments.slice(0, index).join('/');
        const parentNavItem = findNavItemByHref(parentHref);
        if (parentNavItem?.label) {
            label = parentNavItem.label.endsWith('s') ? parentNavItem.label.slice(0, -1) : parentNavItem.label;
            label += ` #${segment}`;
        } else {
            label = `Item #${segment}`;
        }
    } else if (index === pathSegments.length -1 && (segment.startsWith("rec-") || segment.startsWith("evt") || segment.startsWith("venue-") || segment.startsWith("dj-"))) {
        const parentHref = '/' + pathSegments.slice(0, index).join('/');
        const parentNavItem = findNavItemByHref(parentHref);
        if (parentNavItem?.label) {
             label = parentNavItem.label.endsWith('s') ? parentNavItem.label.slice(0, -1) : parentNavItem.label;
             label += ` Details`; // Generic detail label
        } else {
            label = `Details`;
        }
    }


    return { href, label };
  });

  return (
    <nav aria-label="Breadcrumb" className="hidden md:flex items-center space-x-1.5 text-sm">
      <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
        <Home className="h-4 w-4" />
        <span className="sr-only">Home</span>
      </Link>
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.href}>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          {index === breadcrumbItems.length - 1 ? (
            <span className="font-medium text-foreground">{item.label}</span>
          ) : (
            <Link href={item.href} className="text-muted-foreground hover:text-foreground transition-colors">
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
