// src/services/eventService.ts
import type { Event, PaginatedResponse, EventFilters } from '@/types';
import { getEventRepository } from './repositoryFactory';
import type { IEventRepository } from './repositories/interfaces/eventRepository.interface';

export class EventService {
  private eventRepository: IEventRepository;

  constructor() {
    this.eventRepository = getEventRepository();
  }

  async getAllEvents(
    filters?: EventFilters,
    pagination?: { page: number; limit: number }
  ): Promise<PaginatedResponse<Event>> {
    return this.eventRepository.findAll(filters, pagination);
  }

  async getAllEventCities(): Promise<string[]> {
    return this.eventRepository.getAllCities();
  }
}
