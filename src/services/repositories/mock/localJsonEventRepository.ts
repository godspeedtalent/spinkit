// src/services/repositories/mock/localJsonEventRepository.ts
import type { IEventRepository } from '../interfaces/eventRepository.interface';
import type { Event, PaginatedResponse, EventFilters } from '@/types';
import eventsDataJson from '@/data/mock-data/json/events.json';

const PAGE_SIZE = 8;

export class LocalJsonEventRepository implements IEventRepository {
  private events: Event[] = eventsDataJson as Event[];

  async findAll(
    filters?: EventFilters,
    pagination: { page: number; limit: number } = { page: 1, limit: PAGE_SIZE }
  ): Promise<PaginatedResponse<Event>> {
    let filteredEvents = [...this.events];

    if (filters) {
      if (filters.genres && filters.genres.length > 0) {
        filteredEvents = filteredEvents.filter(event =>
          filters.genres!.some(fg => event.genres.includes(fg))
        );
      }
      if (filters.cities && filters.cities.length > 0) {
        filteredEvents = filteredEvents.filter(event =>
          filters.cities!.some(fc => event.city.toLowerCase() === fc.toLowerCase())
        );
      }
    }
    
    filteredEvents.sort((a, b) => new Date(b.addedDate || 0).getTime() - new Date(a.addedDate || 0).getTime());

    const totalItems = filteredEvents.length;
    const limit = pagination.limit || PAGE_SIZE;
    const page = pagination.page || 1;
    const totalPages = Math.ceil(totalItems / limit);
    const start = (page - 1) * limit;
    const end = page * limit;

    const paginatedItems = filteredEvents.slice(start, end);

    return {
      items: paginatedItems,
      totalItems,
      hasMore: page < totalPages,
      currentPage: page,
      totalPages,
    };
  }

  async getAllCities(): Promise<string[]> {
    return Array.from(new Set(this.events.map(event => event.city))).sort();
  }
}