// src/services/repositories/notion/notionVenueRepository.ts
import type { IVenueRepository } from '../interfaces/venueRepository.interface';
import type { Venue, PaginatedResponse, VenueFilters } from '@/types';
// import { Client } from '@notionhq/client';

// const NOTION_API_KEY = process.env.NOTION_API_KEY;
// const NOTION_VENUES_DATABASE_ID = process.env.NOTION_VENUES_DATABASE_ID;
// const notionClient = NOTION_API_KEY ? new Client({ auth: NOTION_API_KEY }) : null;

export class NotionVenueRepository implements IVenueRepository {
  constructor() {
    if (process.env.NODE_ENV === 'development') {
      console.log('[NotionVenueRepository] Instantiated. NOTION_API_KEY and NOTION_VENUES_DATABASE_ID must be set in .env for real operations.');
    }
  }
  async findAll(filters?: VenueFilters, pagination?: { page: number; limit: number }): Promise<PaginatedResponse<Omit<Venue, 'description' | 'typicalEventDays' | 'soundSystem' | 'totalBookings' | 'totalRSVPs'>>> {
    console.warn("Notion findAll Venues not implemented. Returning empty array.");
    return { items: [], totalItems: 0, currentPage: 1, totalPages: 0, hasMore: false };
  }

  async findById(id: string): Promise<Venue | undefined> {
    console.warn(`Notion findById Venue (${id}) not implemented.`);
    return undefined;
  }
}
