// src/services/repositories/interfaces/genreRepository.interface.ts
import type { Genre as AppGenreType } from '@/types'; // Use AppGenreType alias for clarity

export interface IGenreRepository {
  findAll(): Promise<AppGenreType[]>; // Changed from Promise<string[]>
  findByName(genreName: string): Promise<AppGenreType | undefined>;
}
