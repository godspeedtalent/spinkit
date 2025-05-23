
// src/config/data-import-config.ts
import type { DatabaseConnection } from '@/stores/databaseSettingsStore'; 

export const DATA_ENTITIES_KEYS: (keyof Required<DatabaseConnection>['collections'])[] = ['cities', 'djs', 'events', 'genres', 'recordings', 'venues'];

export const DO_NOT_IMPORT_VALUE = "_DO_NOT_IMPORT_";
export const CREATE_NEW_FIELD_VALUE = "_CREATE_NEW_FIELD_";

export const NEW_FIELD_TYPE_OPTIONS = [
  "Array", // Simplified: "Array (simple string)" -> "Array"
  "Boolean",
  "Date",
  "Number",
  "ObjectId / String", // For IDs
  "Text",
  "URL",
].sort();

// This map defines the expected fields for each MongoDB collection based on your src/types.ts
// It's used to populate the "Target Field" dropdown in column mapping.
export const TARGET_MONGO_FIELDS_MAP: Record<string, string[]> = {
  djs: ['id', 'name', 'genres', 'location', 'score', 'imageUrl', 'aiHint', 'addedDate', 'bio', 'specialties', 'recordings'].sort(),
  venues: ['id', 'name', 'location', 'imageUrl', 'aiHint', 'description', 'capacity', 'djNeeds', 'fanScore', 'addedDate', 'typicalEventDays', 'soundSystem', 'totalBookings', 'totalRSVPs'].sort(),
  events: ['id', 'name', 'djName', 'djId', 'venueName', 'venueId', 'date', 'time', 'city', 'genres', 'imageUrl', 'aiHint', 'description', 'expectedAttendance', 'addedDate'].sort(),
  recordings: ['id', 'djId', 'djName', 'title', 'album', 'year', 'type', 'artworkUrl', 'aiHint', 'genre', 'description', 'fanScore', 'totalPlays', 'addedDate'].sort(),
  genres: ['name', 'slug', 'imageSeed', 'aiHint', 'description', 'topArtists', 'topVenues'].sort(),
  cities: ['name', 'slug', 'profilePicSeed', 'aiHint', 'description', 'topDjs', 'topVenues', 'popularGenres'].sort(),
  // 'users' would be added here if you had a specific User type for the database
  // users: ['id', 'username', 'email', 'role', 'profilePicUrl', 'favoriteGenres'].sort()
};

// Helper to get a user-friendly label for a DATA_ENTITIES_KEYS key
export const getEntityTypeLabel = (key: (typeof DATA_ENTITIES_KEYS)[number]): string => {
  const label = key.charAt(0).toUpperCase() + key.slice(1);
  // Simple pluralization for common cases, can be expanded
  if (label.endsWith('s')) return label; // DJs, Venues, Events, Recordings, Genres, Cities
  return label; // Fallback
};
    