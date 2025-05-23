
// src/types.ts

export type UserRole = "Buyer" | "Artist" | "Fan" | "Admin" | "Guest";

export interface DJ {
  id: string;
  name: string;
  genres: string[];
  location: string;
  score: number;
  imageUrl: string; 
  aiHint: string;
  addedDate?: string; // ISO date string
  bio?: string;
  specialties?: string[];
  recordings?: Recording[]; 
}

export interface Recording {
  id:string;
  djId?: string;
  djName?: string;
  title: string;
  album?: string;
  year: number;
  type: 'Single' | 'EP' | 'Album' | 'Mix';
  artworkUrl: string; 
  aiHint: string;
  genre: string;
  description?: string;
  fanScore?: number;
  totalPlays?: number;
  addedDate?: string; // ISO date string
}

export interface Venue {
  id: string;
  name: string;
  location: string;
  imageUrl: string; 
  aiHint: string;
  description?: string;
  capacity: number;
  typicalEventDays?: string[];
  soundSystem?: string[];
  djNeeds: string[]; 
  totalBookings?: number;
  fanScore: number;
  totalRSVPs?: number;
  addedDate?: string; // ISO date string
}

export interface Event {
  id: string;
  name: string;
  djName?: string;
  djId?: string;
  venueName: string;
  venueId: string;
  date: string; // ISO date string
  time: string;
  city: string;
  genres: string[];
  imageUrl: string; 
  aiHint: string;
  description?: string;
  expectedAttendance?: number;
  addedDate?: string; // ISO date string
}

export interface Genre {
  name: string;
  slug: string; 
  imageSeed?: string; 
  aiHint?: string; 
  description?: string;
  topArtists?: Pick<DJ, 'id' | 'name' | 'imageUrl' | 'aiHint'>[];
  topVenues?: Pick<Venue, 'id' | 'name' | 'location' | 'imageUrl' | 'aiHint'>[];
}

// Interface for city objects from cities.json
export interface CityObject {
  name: string;
  slug: string;
  profilePic: string; 
  aiHint?: string;
  description?: string; // Added for consistency if AI description is stored
}

export interface CityDetails {
  name: string;
  slug?: string;
  profilePicSeed?: string; // Used as seed for generateUnsplashUrl for detail page
  aiHint?: string;
  description: string;
  topDjs: Pick<DJ, 'id' | 'name' | 'genres' | 'imageUrl' | 'aiHint' | 'location'>[];
  topVenues: Pick<Venue, 'id' | 'name' | 'location' | 'imageUrl' | 'aiHint'>[];
  popularGenres: string[];
}

// For client-side state management, we might add `isFavorited`
export interface Favoritable {
  isFavorited?: boolean;
}

export type DJClient = DJ & Favoritable;
export type VenueClient = Venue & Favoritable;
export type RecordingClient = Recording & Favoritable;
export type EventClient = Event & Favoritable;

// For paginated API responses
export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}

// Filter types for API requests
export interface BaseApiFilters {
  page?: number;
  limit?: number;
}

export interface DjFilters extends BaseApiFilters {
  genres?: string[]; 
  location?: string;
  minScore?: number;
  maxScore?: number; // Added for range slider
}

export interface VenueFilters extends BaseApiFilters {
  location?: string;
  minCapacity?: number;
  minFanScore?: number;
  genres?: string[]; // For djNeeds
}

export interface EventFilters extends BaseApiFilters {
  genres?: string[]; 
  cities?: string[]; 
}

export interface RecordingFilters extends BaseApiFilters {
   genres?: string[];
}

// For Payments Page - Artist View
export interface ArtistTransaction {
  id: string;
  buyerId: string; // For linking
  buyerName: string;
  eventName: string;
  date: string; // YYYY-MM-DD
  amount: number;
  status: "Paid" | "Pending Payment" | "Processing Payout" | "Overdue";
}

// Sort Option Types for Discovery Pages
export type DjSortOption = "name_asc" | "name_desc" | "score_asc" | "score_desc" | "recent";
export type VenueSortOption = "name_asc" | "name_desc" | "capacity_asc" | "capacity_desc" | "score_asc" | "score_desc" | "recent";
export type EventSortOption = "date_asc" | "date_desc" | "name_asc" | "name_desc" | "city_asc" | "city_desc" | "attendance_desc" | "attendance_asc" | "recent";
export type RecordingSortOption = "title_asc" | "title_desc" | "artist_asc" | "artist_desc" | "year_new" | "year_old" | "score_desc" | "score_asc" | "recent";

// Card Size Type
export type CardSize = "small" | "medium" | "large";
