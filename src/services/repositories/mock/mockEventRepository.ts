
// src/services/repositories/mock/mockEventRepository.ts
import type { IEventRepository } from '../interfaces/eventRepository.interface';
import type { Event, PaginatedResponse, EventFilters } from '@/types';
import eventsData from '@/data/mock-data/json/events.json';

const PAGE_SIZE = 8;

export class MockEventRepository implements IEventRepository {
  private events: Event[] = eventsData as Event[];

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
    const totalPages = Math.ceil(totalItems / pagination.limit);
    const start = (pagination.page - 1) * pagination.limit;
    const end = pagination.page * pagination.limit;

    const paginatedItems = filteredEvents.slice(start, end);

    return {
      items: paginatedItems,
      totalItems,
      hasMore: pagination.page < totalPages,
      currentPage: pagination.page,
      totalPages,
    };
  }

  async getAllCities(): Promise<string[]> {
    return Array.from(new Set(this.events.map(event => event.city))).sort();
  }
}

    