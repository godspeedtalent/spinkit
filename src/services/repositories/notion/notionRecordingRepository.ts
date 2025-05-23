// src/services/repositories/notion/notionRecordingRepository.ts
import type { IRecordingRepository } from '../interfaces/recordingRepository.interface';
import type { Recording, PaginatedResponse, RecordingFilters } from '@/types';
// import { Client } from '@notionhq/client';

// const NOTION_API_KEY = process.env.NOTION_API_KEY;
// const NOTION_RECORDINGS_DATABASE_ID = process.env.NOTION_RECORDINGS_DATABASE_ID;
// const notionClient = NOTION_API_KEY ? new Client({ auth: NOTION_API_KEY }) : null;

export class NotionRecordingRepository implements IRecordingRepository {
  constructor() {
    if (process.env.NODE_ENV === 'development') {
      console.log('[NotionRecordingRepository] Instantiated. NOTION_API_KEY and NOTION_RECORDINGS_DATABASE_ID must be set in .env for real operations.');
    }
  }
  async findAll(filters?: RecordingFilters, pagination?: { page: number; limit: number }): Promise<PaginatedResponse<Omit<Recording, 'description'>>> {
    console.warn("Notion findAll Recordings not implemented. Returning empty array.");
    return { items: [], totalItems: 0, currentPage: 1, totalPages: 0, hasMore: false };
  }

  async findById(id: string): Promise<Recording | undefined> {
    console.warn(`Notion findById Recording (${id}) not implemented.`);
    return undefined;
  }
}
