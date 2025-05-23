
'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface PlaceholderImageProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  seed?: string; // Used to generate a somewhat consistent color
  ariaLabel?: string;
}

const colors = [
  'bg-red-300', 'bg-orange-300', 'bg-amber-300', 'bg-yellow-300',
  'bg-lime-300', 'bg-green-300', 'bg-emerald-300', 'bg-teal-300',
  'bg-cyan-300', 'bg-sky-300', 'bg-blue-300', 'bg-indigo-300',
  'bg-violet-300', 'bg-purple-300', 'bg-fuchsia-300', 'bg-pink-300',
  'bg-rose-300',
  'bg-slate-300', 'bg-gray-300', 'bg-zinc-300', 'bg-neutral-300', 'bg-stone-300',
];

// Simple hash function to get a somewhat consistent index based on a seed
const simpleHash = (str: string): number => {
  let hash = 0;
  if (!str || str.length === 0) {
    return Math.floor(Math.random() * colors.length); // fallback for empty seed
  }
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

const PlaceholderImage: React.FC<PlaceholderImageProps> = ({
  width,
  height,
  className,
  seed = 'default-seed', // Provide a default seed
  ariaLabel = 'Placeholder image',
}) => {
  const bgColor = useMemo(() => {
    return colors[simpleHash(seed) % colors.length];
  }, [seed]);

  const style: React.CSSProperties = {};
  if (width !== undefined) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height !== undefined) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={cn(
        'flex items-center justify-center text-xs text-neutral-600', // Added text color for potential text inside
        bgColor,
        className
      )}
      style={style}
      role="img"
      aria-label={ariaLabel}
      data-placeholder-image="true"
      data-seed={seed} // For debugging
    >
      {/* You could add text like `${width}x${height}` or an icon here if needed */}
    </div>
  );
};

export default PlaceholderImage;
