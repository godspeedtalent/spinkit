// src/services/cityService.ts
import type { CityDetails } from '@/types';
import { getCityRepository } from './repositoryFactory';
import type { ICityRepository } from './repositories/interfaces/cityRepository.interface';

export class CityService {
  private cityRepository: ICityRepository;

  constructor() {
    this.cityRepository = getCityRepository();
  }

  async getCityPageDetails(cityName: string): Promise<CityDetails | null> {
    // The AI description generation logic is now inside the MockCityRepository
    return this.cityRepository.getCityDetails(cityName);
  }

  async getAllCitiesList(): Promise<string[]> {
    return this.cityRepository.findAllNames();
  }
}
