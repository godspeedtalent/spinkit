// src/services/repositories/mock/mockGenreRepository.ts
import type { IGenreRepository } from '../interfaces/genreRepository.interface';
import type { Genre as AppGenreType, DJ, Venue } from '@/types'; // Use AppGenreType
import allGenresJson from '@/data/mock-data/json/genres.json';
import djsDataJson from '@/data/mock-data/json/djs.json';
import venuesDataJson from '@/data/mock-data/json/venues.json';

const djs: DJ[] = djsDataJson as DJ[];
const venues: Venue[] = venuesDataJson as Venue[];

export class MockGenreRepository implements IGenreRepository {
  private allGenresData: AppGenreType[] = allGenresJson as AppGenreType[];

  async findAll(): Promise<AppGenreType[]> { // Changed return type
    // Return full genre objects, sorted by name
    return [...this.allGenresData].sort((a, b) => a.name.localeCompare(b.name));
  }

  async findByName(genreName: string): Promise<AppGenreType | undefined> {
    const genre = this.allGenresData.find(g => g.name.toLowerCase() === genreName.toLowerCase());
    if (genre) {
      const topArtists = djs
        .filter(dj => dj.genres.includes(genre.name))
        .slice(0, 4)
        .map(dj => ({ id: dj.id, name: dj.name, imageUrl: dj.imageUrl, aiHint: dj.aiHint }));

      const topVenues = venues
        .filter(venue => venue.djNeeds.includes(genre.name))
        .slice(0, 4)
        .map(venue => ({ id: venue.id, name: venue.name, location: venue.location, imageUrl: venue.imageUrl, aiHint: venue.aiHint }));
      
      return {
        ...genre, // Include all properties from the JSON object (name, slug, imageSeed, aiHint)
        description: genre.description || `Discover the world of ${genre.name} music, featuring top artists and venues.`, // Add a default description
        topArtists: topArtists,
        topVenues: topVenues,
      };
    }
    return undefined;
  }
}
