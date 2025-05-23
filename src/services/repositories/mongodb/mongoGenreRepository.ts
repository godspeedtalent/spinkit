// src/services/repositories/mongodb/mongoGenreRepository.ts
// Placeholder for MongoDB Genre Repository
import type { IGenreRepository } from '../interfaces/genreRepository.interface';
import type { Genre as AppGenreType } from '@/types';
// import clientPromise from '@/lib/mongodb'; // You would use this

export class MongoGenreRepository implements IGenreRepository {
  async findAll(): Promise<AppGenreType[]> {
    console.warn("MongoDB findAll Genres not implemented. Returning empty array.");
    return [];
  }

  async findByName(genreName: string): Promise<AppGenreType | undefined> {
    console.warn(`MongoDB findByName Genre (${genreName}) not implemented.`);
    // This would likely involve fetching the genre doc, then related DJs/Venues
    return undefined;
  }
}
