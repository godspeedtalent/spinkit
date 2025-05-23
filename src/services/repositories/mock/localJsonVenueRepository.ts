// src/services/repositories/mock/localJsonVenueRepository.ts
import type { IVenueRepository } from '../interfaces/venueRepository.interface';
import type { Venue, PaginatedResponse, VenueFilters } from '@/types';
import venuesDataJson from '@/data/mock-data/json/venues.json';

const PAGE_SIZE = 8;

export class LocalJsonVenueRepository implements IVenueRepository {
  private venues: Venue[] = venuesDataJson as Venue[];

  async findAll(
    filters?: VenueFilters,
    pagination: { page: number; limit: number } = { page: 1, limit: PAGE_SIZE }
  ): Promise<PaginatedResponse<Omit<Venue, 'description' | 'typicalEventDays' | 'soundSystem' | 'totalBookings' | 'totalRSVPs'>>> {
    let filteredVenues = [...this.venues];

    if (filters) {
      if (filters.location) {
        filteredVenues = filteredVenues.filter(venue =>
          venue.location.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }
      if (filters.minCapacity !== undefined) {
        filteredVenues = filteredVenues.filter(venue => venue.capacity >= filters.minCapacity!);
      }
      if (filters.minFanScore !== undefined) {
        filteredVenues = filteredVenues.filter(venue => venue.fanScore >= filters.minFanScore!);
      }
      if (filters.genres && filters.genres.length > 0) {
        filteredVenues = filteredVenues.filter(venue =>
          filters.genres!.some(fg => venue.djNeeds.includes(fg))
        );
      }
    }
    
    filteredVenues.sort((a, b) => new Date(b.addedDate || 0).getTime() - new Date(a.addedDate || 0).getTime());

    const totalItems = filteredVenues.length;
    const limit = pagination.limit || PAGE_SIZE;
    const page = pagination.page || 1;
    const totalPages = Math.ceil(totalItems / limit);
    const start = (page - 1) * limit;
    const end = page * limit;

    const paginatedItems = filteredVenues
      .map(({ description, typicalEventDays, soundSystem, totalBookings, totalRSVPs, ...rest }) => rest)
      .slice(start, end);

    return {
      items: paginatedItems,
      totalItems,
      hasMore: page < totalPages,
      currentPage: page,
      totalPages,
    };
  }

  async findById(id: string): Promise<Venue | undefined> {
    return this.venues.find(venue => venue.id === id);
  }
}