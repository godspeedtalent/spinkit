import React from 'react';
import Link from 'next/link';
import { Badge, type BadgeProps } from '@/components/ui/badge'; // Assuming BadgeProps might be useful for variant
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EntityTagsProps {
  tags: string[];
  icon?: LucideIcon; // React.ElementType can be broader, LucideIcon is more specific if that's the intent
  tooltipLabel: string;
  tagLinkPrefix?: string;
  visibleTagCount?: number;
  badgeVariant?: BadgeProps['variant']; // Use variant type from BadgeProps
  className?: string;
}

export const EntityTags: React.FC<EntityTagsProps> = ({
  tags,
  icon: Icon,
  tooltipLabel,
  tagLinkPrefix,
  visibleTagCount = 3,
  badgeVariant = 'secondary',
  className,
}) => {
  if (!tags || tags.length === 0) {
    return null; // Don't render anything if there are no tags
  }

  const displayedTags = tags.slice(0, visibleTagCount);
  const hasMoreTags = tags.length > visibleTagCount;

  const renderTagBadge = (tag: string, isEllipsis = false) => {
    const badgeContent = <Badge variant={badgeVariant} className={cn(!isEllipsis && tagLinkPrefix && "hover:bg-secondary/80 cursor-pointer", isEllipsis && "cursor-default")}>{isEllipsis ? '...' : tag}</Badge>;

    if (isEllipsis || !tagLinkPrefix) {
      return badgeContent;
    }

    return (
      <Link key={tag} href={`${tagLinkPrefix}${encodeURIComponent(tag)}`} passHref legacyBehavior>
        {badgeContent}
      </Link>
    );
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center flex-wrap gap-1 cursor-default", className)}>
            {Icon && <Icon className="mr-1 h-3.5 w-3.5 text-muted-foreground" />}
            {displayedTags.map((tag) => renderTagBadge(tag))}
            {hasMoreTags && renderTagBadge('...', true)}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipLabel}</p>
          {/* Future enhancement: list all tags here if needed */}
          {/* <p>{tags.join(', ')}</p> */}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
