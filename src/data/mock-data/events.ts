// src/data/mock-data/events.ts
import type { Event as EventType } from '@/types';
import eventsDataJson from './json/events.json';
import { generateUnsplashUrl } from '@/lib/utils'; // Import centralized helper

export const eventsMockData: EventType[] = eventsDataJson.map(rawEventData => {
  const { 
    id, 
    name, 
    djName, 
    djId, 
    venueName, 
    venueId, 
    date, 
    time, 
    city, 
    genres, 
    aiHint: eventAiHint, 
    description, 
    expectedAttendance, 
    addedDate,
    image // This is the field from JSON that might contain the seed or direct URL
  } = rawEventData;

  const finalImageUrl = (image && image.startsWith('http'))
                        ? image
                        : generateUnsplashUrl(600, 400, eventAiHint || name, "music event concert");

  return {
    id,
    name,
    djName,
    djId,
    venueName,
    venueId,
    date: new Date(date).toISOString(),
    time,
    city: city || "Metro City", // Fallback
    genres: genres || ["Electronic"], // Fallback
    imageUrl: finalImageUrl,
    aiHint: eventAiHint || name || "event", // Ensure aiHint is populated
    description: description || `An exciting event: ${name}. Don't miss out!`, // Fallback
    expectedAttendance: expectedAttendance || 100, // Fallback
    addedDate: addedDate || new Date().toISOString()
  };
});

export const allEventCitiesList = Array.from(new Set(eventsMockData.map(event => event.city))).sort();
