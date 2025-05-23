// src/data/mock-data/genres.ts
import type { Genre as AppGenreType, DJ, Venue } from '@/types';
import allGenresJson from './json/genres.json'; // Array of {name, slug, image (seed), aiHint, description}
import djsDataJson from './json/djs.json';
import venuesDataJson from './json/venues.json';
import { generateUnsplashUrl } from '@/lib/utils'; // Import centralized helper

const djs: DJ[] = djsDataJson as DJ[]; 
const venues: Venue[] = venuesDataJson as Venue[]; 

export const allGenresDataList: string[] = allGenresJson.map(g => g.name).sort();

export const getGenreDetailsData = (genreName: string): AppGenreType | undefined => {
  const genreJsonData = allGenresJson.find(g => g.name.toLowerCase() === genreName.toLowerCase());
  
  if (genreJsonData) {
    const topArtists = djs
      .filter(dj => dj.genres.includes(genreJsonData.name))
      .slice(0, 4)
      .map(dj => ({ 
        id: dj.id, 
        name: dj.name, 
        imageUrl: (dj.profilePic && dj.profilePic.startsWith('http')) 
                    ? dj.profilePic 
                    : generateUnsplashUrl(100, 100, dj.aiHint || dj.name, "dj portrait"),
        aiHint: dj.aiHint 
      }));

    const topVenues = venues
      .filter(venue => venue.djNeeds?.includes(genreJsonData.name)) // Added optional chaining for djNeeds
      .slice(0, 4) 
      .map(venue => ({ 
        id: venue.id, 
        name: venue.name, 
        location: venue.location, 
        imageUrl: (venue.imageUrl && venue.imageUrl.startsWith('http')) 
                    ? venue.imageUrl 
                    : generateUnsplashUrl(100, 75, venue.aiHint || venue.name, "venue exterior"),
        aiHint: venue.aiHint 
      }));
    
    const finalImageSeed = (genreJsonData.image && genreJsonData.image.startsWith('http'))
                          ? genreJsonData.image 
                          : generateUnsplashUrl(600,400, genreJsonData.aiHint || genreJsonData.name, "abstract music");


    return {
      name: genreJsonData.name,
      slug: genreJsonData.slug || genreJsonData.name.toLowerCase().replace(/\s+/g, '-'),
      imageSeed: finalImageSeed, 
      aiHint: genreJsonData.aiHint || genreJsonData.name,
      description: genreJsonData.description || `Explore the world of ${genreJsonData.name} music, featuring top artists and venues.`,
      topArtists: topArtists,
      topVenues: topVenues,
    };
  }
  return undefined;
};
