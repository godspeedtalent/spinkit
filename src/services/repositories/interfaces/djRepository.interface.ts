// src/services/repositories/interfaces/djRepository.interface.ts
import type { DJ, PaginatedResponse, DjFilters } from '@/types';

export interface IDjRepository {
  findAll(filters?: DjFilters, pagination?: { page: number; limit: number }): Promise<PaginatedResponse<Omit<DJ, 'bio' | 'specialties' | 'recordings'>>>;
  findById(id: string): Promise<DJ | undefined>;
  getAllGenres(): Promise<string[]>;
  upsert(dj: Omit<DJ, 'id'> & { id?: string }): Promise<DJ | null>; // New method
}
