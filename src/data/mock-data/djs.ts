// src/data/mock-data/djs.ts
import type { DJ as DJType, Recording } from '@/types';
import djsDataJson from './json/djs.json';
import recordingsDataJson from './json/recordings.json';
import { generateUnsplashUrl } from '@/lib/utils'; // Import centralized helper

const allRecordings: Recording[] = recordingsDataJson.map(r => {
  const { artwork, aiHint: recAiHint, title, ...restOfRec } = r;
  const finalArtworkUrl = (artwork && artwork.startsWith('http'))
                          ? artwork
                          : generateUnsplashUrl(400, 400, recAiHint || title, "music album abstract");
  return {
    ...restOfRec,
    artworkUrl: finalArtworkUrl,
    aiHint: recAiHint || title || "music album", // Ensure aiHint is populated
    addedDate: r.addedDate || new Date().toISOString(),
    djId: r.djId,
    djName: r.djName,
    album: r.album,
    year: r.year,
    // @ts-ignore
    type: r.type as Recording['type'],
    genre: r.genre,
    fanScore: r.fanScore,
    totalPlays: r.totalPlays,
    description: r.description,
  };
});

export const djsMockData: DJType[] = djsDataJson.map(rawDjData => {
  const { 
    id, 
    name, 
    genres, 
    location, 
    score, 
    aiHint: djAiHint, 
    profilePic, // This is the seed or direct URL from JSON
    addedDate,
    bio,
    specialties
  } = rawDjData;
  const djRecordings = allRecordings.filter(rec => rec.djId === id);
  
  const finalImageUrl = (profilePic && profilePic.startsWith('http')) 
                       ? profilePic 
                       : generateUnsplashUrl(600, 800, djAiHint || name, "dj portrait cool");

  return {
    id,
    name,
    genres: genres || ["Open Format"], // Fallback for genres
    location: location || "Various Locations", // Fallback for location
    score: score || 0, // Fallback for score
    imageUrl: finalImageUrl,
    aiHint: djAiHint || name || "dj person", // Ensure aiHint is populated
    recordings: djRecordings,
    addedDate: addedDate || new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    bio: bio || `An enigmatic DJ known for captivating sets. ${name} brings a unique energy to every performance.`, // Fallback bio
    specialties: specialties || ["Crowd Reading", "Seamless Transitions"] // Fallback specialties
  };
});

export const allGenresList = Array.from(new Set(djsMockData.flatMap(dj => dj.genres))).sort();
