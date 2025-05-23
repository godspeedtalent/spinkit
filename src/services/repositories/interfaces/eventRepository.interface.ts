// src/services/repositories/interfaces/eventRepository.interface.ts
import type { Event, PaginatedResponse, EventFilters } from '@/types';

export interface IEventRepository {
  findAll(filters?: EventFilters, pagination?: { page: number; limit: number }): Promise<PaginatedResponse<Event>>;
  getAllCities(): Promise<string[]>;
}
