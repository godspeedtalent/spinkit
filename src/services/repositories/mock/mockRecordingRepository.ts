
// src/services/repositories/mock/mockRecordingRepository.ts
import type { IRecordingRepository } from '../interfaces/recordingRepository.interface';
import type { Recording, PaginatedResponse, RecordingFilters } from '@/types';
import recordingsData from '@/data/mock-data/json/recordings.json';

const PAGE_SIZE = 8;

export class MockRecordingRepository implements IRecordingRepository {
  private recordings: Recording[] = recordingsData as Recording[];

  async findAll(
    filters?: RecordingFilters,
    pagination: { page: number; limit: number } = { page: 1, limit: PAGE_SIZE }
  ): Promise<PaginatedResponse<Omit<Recording, 'description'>>> {
    let filteredRecordings = [...this.recordings];

    if (filters) {
      if (filters.genres && filters.genres.length > 0) {
        filteredRecordings = filteredRecordings.filter(rec =>
          filters.genres!.some(fg => rec.genre === fg)
        );
      }
    }
    
    filteredRecordings.sort((a, b) => new Date(b.addedDate || 0).getTime() - new Date(a.addedDate || 0).getTime());

    const totalItems = filteredRecordings.length;
    const totalPages = Math.ceil(totalItems / pagination.limit);
    const start = (pagination.page - 1) * pagination.limit;
    const end = pagination.page * pagination.limit;

    const paginatedItems = filteredRecordings
      .map(({ description, ...rest }) => rest)
      .slice(start, end);

    return {
      items: paginatedItems,
      totalItems,
      hasMore: pagination.page < totalPages,
      currentPage: pagination.page,
      totalPages,
    };
  }

  async findById(id: string): Promise<Recording | undefined> {
    return this.recordings.find(rec => rec.id === id);
  }
}

    