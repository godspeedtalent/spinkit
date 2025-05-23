// src/services/repositories/interfaces/cityRepository.interface.ts
import type { CityDetails } from '@/types';

export interface ICityRepository {
  findAllNames(): Promise<string[]>;
  getCityDetails(cityName: string): Promise<CityDetails | null>;
}
