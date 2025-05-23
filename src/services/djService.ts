// src/services/djService.ts
import type { DJ, PaginatedResponse, DjFilters } from '@/types';
import { getDjRepository } from './repositoryFactory';
import type { IDjRepository } from './repositories/interfaces/djRepository.interface';

export class DjService {
  private djRepository: IDjRepository;

  constructor() {
    this.djRepository = getDjRepository();
  }

  async getAllDjs(
    filters?: DjFilters,
    pagination?: { page: number; limit: number }
  ): Promise<PaginatedResponse<Omit<DJ, 'bio' | 'specialties' | 'recordings'>>> {
    return this.djRepository.findAll(filters, pagination);
  }

  async getDjById(id: string): Promise<DJ | undefined> {
    return this.djRepository.findById(id);
  }

  async getAllDjGenres(): Promise<string[]> {
    return this.djRepository.getAllGenres();
  }
}
