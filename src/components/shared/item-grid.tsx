import React from 'react';
import { cn } from '@/lib/utils';
import CardSkeleton from '@/components/shared/card-skeleton'; // Default skeleton

export type CardSize = 'small' | 'medium' | 'large';

export interface ItemGridProps<T> {
  isLoading: boolean;
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  cardSize: CardSize;
  pageLimit?: number;
  noResultsMessage?: React.ReactNode;
  getGridColsClass: (size: CardSize) => string;
  skeletonComponent?: React.ElementType;
  className?: string;
  itemClassName?: string; // Added as per requirements, used on the direct wrapper of rendered item
}

const DEFAULT_PAGE_LIMIT = 8;

function ItemGrid<T>({
  isLoading,
  items,
  renderItem,
  cardSize,
  pageLimit = DEFAULT_PAGE_LIMIT,
  noResultsMessage = <p>No results found.</p>,
  getGridColsClass,
  skeletonComponent: SkeletonComponent = CardSkeleton,
  className,
  itemClassName,
}: ItemGridProps<T>) {
  const gridColsClass = getGridColsClass(cardSize);

  // Case 1: Loading state (and no items yet to display, or items are from a previous load)
  if (isLoading && items.length === 0) {
    return (
      <div className={cn("grid gap-4 md:gap-6", gridColsClass, className)}>
        {Array.from({ length: pageLimit }).map((_, index) => (
          <div key={`skeleton-${index}`} className={cn(itemClassName)}>
            <SkeletonComponent />
          </div>
        ))}
      </div>
    );
  }

  // Case 2: No results found (and not loading)
  if (!isLoading && items.length === 0) {
    return (
      <div className={cn("flex justify-center items-center h-40", className)}>
        {noResultsMessage}
      </div>
    );
  }

  // Case 3: Items to display
  // We render items even if isLoading is true, assuming items might be from a previous page/cache
  // and will be replaced once new data loads. The loading indicator should be separate.
  if (items.length > 0) {
    return (
      <div
        className={cn(
          "grid gap-4 md:gap-6",
          gridColsClass,
          "animate-slide-up-fade-in", // Apply animation when items are present
          className
        )}
      >
        {items.map((item, index) => (
          <div key={index} className={cn(itemClassName)}> {/* Consider using item.id if available for key */}
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    );
  }

  return null; // Should not be reached if logic is correct
}

export default ItemGrid;
