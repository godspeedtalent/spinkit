// src/services/repositories/notion/notionGenreRepository.ts
import type { IGenreRepository } from '../interfaces/genreRepository.interface';
import type { Genre as AppGenreType } from '@/types';
// import { Client } from '@notionhq/client';

// const NOTION_API_KEY = process.env.NOTION_API_KEY;
// const NOTION_GENRES_DATABASE_ID = process.env.NOTION_GENRES_DATABASE_ID;
// const notionClient = NOTION_API_KEY ? new Client({ auth: NOTION_API_KEY }) : null;

export class NotionGenreRepository implements IGenreRepository {
  constructor() {
    if (process.env.NODE_ENV === 'development') {
      console.log('[NotionGenreRepository] Instantiated. NOTION_API_KEY and NOTION_GENRES_DATABASE_ID must be set in .env for real operations.');
    }
  }
  async findAll(): Promise<AppGenreType[]> {
    console.warn("Notion findAll Genres not implemented. Returning empty array.");
    return [];
  }

  async findByName(genreName: string): Promise<AppGenreType | undefined> {
    console.warn(`Notion findByName Genre (${genreName}) not implemented.`);
    return undefined;
  }
}
