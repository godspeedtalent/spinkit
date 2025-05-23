// src/services/repositories/mock/mockCityRepository.ts
import type { ICityRepository } from '../interfaces/cityRepository.interface';
import type { CityDetails, DJ, Venue, CityObject as AppCityObject } from '@/types'; // Import CityObject from types
import allCitiesJson from '@/data/mock-data/json/cities.json';
import djsData from '@/data/mock-data/json/djs.json';
import venuesData from '@/data/mock-data/json/venues.json';
import allGenres from '@/data/mock-data/json/genres.json';
import { generateCityDjSceneDescription } from '@/ai/flows/generate-city-dj-scene-description';

// Use the CityObject type from global types.ts
const allCities: AppCityObject[] = allCitiesJson as AppCityObject[];

export class MockCityRepository implements ICityRepository {
  private djs: DJ[] = djsData as DJ[];
  private venues: Venue[] = venuesData as Venue[];
  private allGenresList: string[] = allGenres;

  async findAllNames(): Promise<string[]> {
    return allCities.map(city => city.name).sort();
  }

  async getCityDetails(cityName: string): Promise<CityDetails | null> {
    const cityObject = allCities.find(city => city.name.toLowerCase() === cityName.toLowerCase());
    // if (!cityObject) {
    //   // Optionally handle if city name doesn't match exactly
    //   // For now, we proceed, AI description will use the provided name
    // }

    let description = `Explore the vibrant music scene of ${cityName}!`;
    let aiHintForCityImage = cityObject?.aiHint || cityName.toLowerCase(); // Use city name as hint if object not found

    if (cityName && cityName !== "Worldwide" && cityName !== "National") {
      try {
        const aiDesc = await generateCityDjSceneDescription({ cityName });
        description = aiDesc.description;
      } catch (e) {
        console.error(`Failed to get AI description for ${cityName}:`, e);
        description = `Discover the unique sounds and venues of ${cityName}. While we couldn't fetch a live AI description, rest assured it's a place with a beat!`;
      }
    } else if (cityName === "Worldwide") {
      description = "Explore music from every corner of the globe. Discover international artists, iconic venues, and trending genres worldwide.";
      aiHintForCityImage = "globe earth map";
    } else if (cityName === "National") {
      description = "Discover the nation's top artists, renowned venues, and the most popular music genres defining the sound of the country.";
      aiHintForCityImage = "national landscape map";
    }


    let cityDjs: Pick<DJ, 'id' | 'name' | 'genres' | 'imageUrl' | 'aiHint' | 'location'>[] = [];
    let cityVenues: Pick<Venue, 'id' | 'name' | 'location' | 'imageUrl' | 'aiHint'>[] = [];
    let cityPopularGenres: string[] = [];

    if (cityName === "Worldwide" || cityName === "National") {
      cityDjs = this.djs.sort(() => 0.5 - Math.random()).slice(0, 4).map(dj => ({id: dj.id, name: dj.name, genres: dj.genres, imageUrl: dj.imageUrl, aiHint: dj.aiHint, location: dj.location}));
      cityVenues = this.venues.sort(() => 0.5 - Math.random()).slice(0, 4).map(v => ({id: v.id, name: v.name, location: v.location, imageUrl: v.imageUrl, aiHint: v.aiHint}));
      const randomStart = Math.floor(Math.random() * (this.allGenresList.length - Math.min(3, this.allGenresList.length) ));
      cityPopularGenres = this.allGenresList.slice(randomStart, randomStart + 3 + Math.floor(Math.random() * 2));
    } else {
      cityDjs = this.djs
        .filter(dj => dj.location.toLowerCase().includes(cityName.toLowerCase()))
        .sort(() => 0.5 - Math.random())
        .slice(0, 4)
        .map(dj => ({id: dj.id, name: dj.name, genres: dj.genres, imageUrl: dj.imageUrl, aiHint: dj.aiHint, location: dj.location}));

      cityVenues = this.venues
        .filter(venue => venue.location.toLowerCase().includes(cityName.toLowerCase()))
        .sort(() => 0.5 - Math.random())
        .slice(0, 4)
        .map(v => ({id: v.id, name: v.name, location: v.location, imageUrl: v.imageUrl, aiHint: v.aiHint}));

      let derivedGenres: string[] = [];
      cityDjs.forEach(dj => derivedGenres.push(...dj.genres));
      cityVenues.forEach(vCard => {
          const fullVenue = this.venues.find(v => v.id === vCard.id);
          if (fullVenue) derivedGenres.push(...fullVenue.djNeeds);
      });

      if (derivedGenres.length === 0 && this.allGenresList.length > 0) {
        const randomStart = Math.floor(Math.random() * (this.allGenresList.length - Math.min(3, this.allGenresList.length)));
        cityPopularGenres = this.allGenresList.slice(randomStart, randomStart + 3 + Math.floor(Math.random() * 2));
      } else {
        const genreCounts = derivedGenres.reduce((acc, genre) => {
          acc[genre] = (acc[genre] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        cityPopularGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(entry => entry[0]);
      }
    }

    return {
      name: cityName,
      slug: cityObject?.slug || cityName.toLowerCase().replace(/\s+/g, '-'),
      profilePicSeed: cityObject?.profilePic || aiHintForCityImage, // Use profilePic from JSON as seed
      aiHint: aiHintForCityImage,
      description: description,
      topDjs: cityDjs,
      topVenues: cityVenues,
      popularGenres: cityPopularGenres,
    };
  }
}
