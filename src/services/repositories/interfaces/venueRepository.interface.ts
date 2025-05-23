// src/services/repositories/interfaces/venueRepository.interface.ts
import type { Venue, PaginatedResponse, VenueFilters } from '@/types';

export interface IVenueRepository {
  findAll(filters?: VenueFilters, pagination?: { page: number; limit: number }): Promise<PaginatedResponse<Omit<Venue, 'description' | 'typicalEventDays' | 'soundSystem' | 'totalBookings' | 'totalRSVPs'>>>;
  findById(id: string): Promise<Venue | undefined>;
}
