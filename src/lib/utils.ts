import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const generateUnsplashUrl = (width: number, height: number, hint: string | undefined, defaultHint: string = "abstract") => {
  let keywords = (hint || defaultHint).trim().toLowerCase();
  // Replace multiple spaces with a single comma, then replace single spaces with commas
  keywords = keywords.replace(/\s\s+/g, ',').replace(/\s/g, ',');
  // Remove any characters not alphanumeric, hyphen, or comma
  keywords = keywords.replace(/[^a-z0-9,-]/g, '');
  // Remove leading/trailing commas and multiple commas
  keywords = keywords.replace(/^,|,$/g, '').replace(/,,+/g, ',');
  if (!keywords || keywords === ',') {
    // Fallback to a very simple default if keywords become empty after sanitization
    keywords = defaultHint.replace(/\s/g,',').split(',').slice(0,1).join('') || "random";
  }
  const encodedKeywords = encodeURIComponent(keywords);
  return `https://source.unsplash.com/featured/${width}x${height}/?${encodedKeywords}`;
};
