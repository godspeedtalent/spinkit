// src/services/repositories/mock/localJsonRecordingRepository.ts
import type { IRecordingRepository } from '../interfaces/recordingRepository.interface';
import type { Recording, PaginatedResponse, RecordingFilters } from '@/types';
import recordingsDataJson from '@/data/mock-data/json/recordings.json';

const PAGE_SIZE = 8;

export class LocalJsonRecordingRepository implements IRecordingRepository {
  private recordings: Recording[] = recordingsDataJson as Recording[];

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
    const limit = pagination.limit || PAGE_SIZE;
    const page = pagination.page || 1;
    const totalPages = Math.ceil(totalItems / limit);
    const start = (page - 1) * limit;
    const end = page * limit;

    const paginatedItems = filteredRecordings
      .map(({ description, ...rest }) => rest)
      .slice(start, end);

    return {
      items: paginatedItems,
      totalItems,
      hasMore: page < totalPages,
      currentPage: page,
      totalPages,
    };
  }

  async findById(id: string): Promise<Recording | undefined> {
    return this.recordings.find(rec => rec.id === id);
  }
}