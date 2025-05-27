// src/services/repositories/mock/localJsonGenreRepository.ts
import type { IGenreRepository } from '../interfaces/genreRepository.interface';
import type { Genre as AppGenreType, DJ, Venue } from '@/types';
import allGenresJson from '@/data/mock-data/json/genres.json';
import djsDataJson from '@/data/mock-data/json/djs.json';
import venuesDataJson from '@/data/mock-data/json/venues.json';

const djs: DJ[] = djsDataJson as unknown as DJ[];
const venues: Venue[] = venuesDataJson as Venue[];

export class LocalJsonGenreRepository implements IGenreRepository {
  private allGenresData: AppGenreType[] = allGenresJson as AppGenreType[];

  async findAll(): Promise<AppGenreType[]> {
    return [...this.allGenresData]
      .map(g => ({ // Ensure all required fields are present
        name: g.name,
        slug: g.slug || g.name.toLowerCase().replace(/\s+/g, '-'),
        imageSeed: g.imageSeed,
        aiHint: g.aiHint,
        description: g.description,
        topArtists: g.topArtists,
        topVenues: g.topVenues,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async findByName(genreName: string): Promise<AppGenreType | undefined> {
    const genre = this.allGenresData.find(g => g.name.toLowerCase() === genreName.toLowerCase());
    if (genre) {
      const topArtists = djs
        .filter(dj => dj.genres.includes(genre.name))
        .sort(() => 0.5 - Math.random()) // Randomize for mock
        .slice(0, 4)
        .map(dj => ({ id: dj.id, name: dj.name, imageUrl: dj.imageUrl, aiHint: dj.aiHint }));

      const topVenues = venues
        .filter(venue => venue.djNeeds.includes(genre.name))
        .sort(() => 0.5 - Math.random()) // Randomize for mock
        .slice(0, 4)
        .map(venue => ({ id: venue.id, name: venue.name, location: venue.location, imageUrl: venue.imageUrl, aiHint: venue.aiHint }));
      
      return {
        name: genre.name,
        slug: genre.slug || genre.name.toLowerCase().replace(/\s+/g, '-'),
        imageSeed: genre.imageSeed,
        aiHint: genre.aiHint,
        description: genre.description || `Discover the world of ${genre.name} music, featuring top artists and venues.`,
        topArtists: topArtists,
        topVenues: topVenues,
      };
    }
  }
}