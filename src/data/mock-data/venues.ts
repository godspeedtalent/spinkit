// src/data/mock-data/venues.ts
import type { Venue } from '@/types';
import venuesDataJson from './json/venues.json';
import { generateUnsplashUrl } from '@/lib/utils'; // Import centralized helper

export const venuesMockData: Venue[] = venuesDataJson.map(rawVenueData => {
  const { 
    id,
    name,
    location,
    capacity,
    fanScore,
    djNeeds,
    aiHint: venueAiHint,
    imageUrl: seedOrUrl, // This is the seed or URL from JSON
    addedDate,
    description,
    typicalEventDays,
    soundSystem,
    totalBookings,
    totalRSVPs
  } = rawVenueData;

  const finalImageUrl = (seedOrUrl && seedOrUrl.startsWith('http')) 
                        ? seedOrUrl
                        : generateUnsplashUrl(600, 400, venueAiHint || name, "modern architecture venue");
  return {
    id,
    name,
    location: location || "Metro City, USA", // Fallback
    capacity: capacity || 100, // Fallback
    fanScore: fanScore || 0, // Fallback
    djNeeds: djNeeds || ["Open Format"], // Fallback
    imageUrl: finalImageUrl,
    aiHint: venueAiHint || name || "venue", // Ensure aiHint is populated
    addedDate: addedDate || new Date().toISOString(),
    description: description || `A premier venue, ${name}, offering a unique atmosphere for memorable events.`, // Fallback
    typicalEventDays: typicalEventDays || ["Friday", "Saturday"], // Fallback
    soundSystem: soundSystem || ["Professional Setup"], // Fallback
    totalBookings: totalBookings || 0, // Fallback
    totalRSVPs: totalRSVPs || 0 // Fallback
  };
});
