// src/services/recordingService.ts
import type { Recording, PaginatedResponse, RecordingFilters } from '@/types';
import { getRecordingRepository } from './repositoryFactory';
import type { IRecordingRepository } from './repositories/interfaces/recordingRepository.interface';

export class RecordingService {
  private recordingRepository: IRecordingRepository;

  constructor() {
    this.recordingRepository = getRecordingRepository();
  }

  async getAllRecordings(
    filters?: RecordingFilters,
    pagination?: { page: number; limit: number }
  ): Promise<PaginatedResponse<Omit<Recording, 'description'>>> {
    return this.recordingRepository.findAll(filters, pagination);
  }

  async getRecordingById(id: string): Promise<Recording | undefined> {
    return this.recordingRepository.findById(id);
  }
}
