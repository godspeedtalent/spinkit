// src/services/repositories/interfaces/recordingRepository.interface.ts
import type { Recording, PaginatedResponse, RecordingFilters } from '@/types';

export interface IRecordingRepository {
  findAll(filters?: RecordingFilters, pagination?: { page: number; limit: number }): Promise<PaginatedResponse<Omit<Recording, 'description'>>>;
  findById(id: string): Promise<Recording | undefined>;
}
