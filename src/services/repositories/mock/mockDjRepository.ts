
// src/services/repositories/mock/mockDjRepository.ts
import type { IDjRepository } from '../interfaces/djRepository.interface';
import type { DJ, PaginatedResponse, DjFilters, Recording } from '@/types';
import djsData from '@/data/mock-data/json/djs.json';

const PAGE_SIZE = 8;

export class MockDjRepository implements IDjRepository {
  private djs: DJ[] = djsData as DJ[];

  async findAll(
    filters?: DjFilters,
    pagination: { page: number; limit: number } = { page: 1, limit: PAGE_SIZE }
  ): Promise<PaginatedResponse<Omit<DJ, 'bio' | 'specialties' | 'recordings'>>> {
    let filteredDjs = [...this.djs];

    if (filters) {
      if (filters.genres && filters.genres.length > 0) {
        filteredDjs = filteredDjs.filter(dj =>
          filters.genres!.some(fg => dj.genres.includes(fg))
        );
      }
      if (filters.location) {
        filteredDjs = filteredDjs.filter(dj =>
          dj.location.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }
      if (filters.minScore !== undefined) {
        filteredDjs = filteredDjs.filter(dj => dj.score >= filters.minScore!);
      }
      if (filters.maxScore !== undefined) {
        filteredDjs = filteredDjs.filter(dj => dj.score <= filters.maxScore!);
      }
    }
    
    // Sort by addedDate descending if no other sort is implied by filters
    filteredDjs.sort((a, b) => new Date(b.addedDate || 0).getTime() - new Date(a.addedDate || 0).getTime());


    const totalItems = filteredDjs.length;
    const totalPages = Math.ceil(totalItems / pagination.limit);
    const start = (pagination.page - 1) * pagination.limit;
    const end = pagination.page * pagination.limit;

    const paginatedItems = filteredDjs
      .map(({ bio, specialties, recordings, ...rest }) => rest)
      .slice(start, end);

    return {
      items: paginatedItems,
      totalItems,
      hasMore: pagination.page < totalPages,
      currentPage: pagination.page,
      totalPages,
    };
  }

  async findById(id: string): Promise<DJ | undefined> {
    const dj = this.djs.find(dj => dj.id === id);
    if (dj) {
      // Ensure nested recordings also have their dates treated correctly if needed
      const recordings = dj.recordings?.map(r => ({
          ...r,
          addedDate: r.addedDate ? new Date(r.addedDate).toISOString() : undefined
      }));
      return { ...dj, recordings: recordings as Recording[] }; // Cast recordings if necessary
    }
    return undefined;
  }

  async getAllGenres(): Promise<string[]> {
    return Array.from(new Set(this.djs.flatMap(dj => dj.genres))).sort();
  }
}

    