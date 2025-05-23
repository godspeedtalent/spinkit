// src/services/genreService.ts
import type { Genre as AppGenreType } from '@/types'; // Use AppGenreType
import { getGenreRepository } from './repositoryFactory';
import type { IGenreRepository } from './repositories/interfaces/genreRepository.interface';

export class GenreService {
  private genreRepository: IGenreRepository;

  constructor() {
    this.genreRepository = getGenreRepository();
  }

  async getAllGenresList(): Promise<AppGenreType[]> { // Changed return type
    return this.genreRepository.findAll();
  }

  async getGenreDetails(genreName: string): Promise<AppGenreType | undefined> {
    return this.genreRepository.findByName(genreName);
  }
}
