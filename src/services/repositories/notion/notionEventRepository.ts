// src/services/repositories/notion/notionEventRepository.ts
import type { IEventRepository } from '../interfaces/eventRepository.interface';
import type { Event, PaginatedResponse, EventFilters } from '@/types';
// import { Client } from '@notionhq/client';

// const NOTION_API_KEY = process.env.NOTION_API_KEY;
// const NOTION_EVENTS_DATABASE_ID = process.env.NOTION_EVENTS_DATABASE_ID;
// const notionClient = NOTION_API_KEY ? new Client({ auth: NOTION_API_KEY }) : null;

export class NotionEventRepository implements IEventRepository {
  constructor() {
    if (process.env.NODE_ENV === 'development') {
      console.log('[NotionEventRepository] Instantiated. NOTION_API_KEY and NOTION_EVENTS_DATABASE_ID must be set in .env for real operations.');
    }
  }
  async findAll(filters?: EventFilters, pagination?: { page: number; limit: number }): Promise<PaginatedResponse<Event>> {
    console.warn("Notion findAll Events not implemented. Returning empty array.");
    return { items: [], totalItems: 0, currentPage: 1, totalPages: 0, hasMore: false };
  }

  async getAllCities(): Promise<string[]> {
    console.warn("Notion getAllCities for Events not implemented.");
    return [];
  }
}
