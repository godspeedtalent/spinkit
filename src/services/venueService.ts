// src/services/venueService.ts
import type { Venue, PaginatedResponse, VenueFilters } from '@/types';
import { getVenueRepository } from './repositoryFactory';
import type { IVenueRepository } from './repositories/interfaces/venueRepository.interface';

export class VenueService {
  private venueRepository: IVenueRepository;

  constructor() {
    this.venueRepository = getVenueRepository();
  }

  async getAllVenues(
    filters?: VenueFilters,
    pagination?: { page: number; limit: number }
  ): Promise<PaginatedResponse<Omit<Venue, 'description' | 'typicalEventDays' | 'soundSystem' | 'totalBookings' | 'totalRSVPs'>>> {
    return this.venueRepository.findAll(filters, pagination);
  }

  async getVenueById(id: string): Promise<Venue | undefined> {
    return this.venueRepository.findById(id);
  }
}
