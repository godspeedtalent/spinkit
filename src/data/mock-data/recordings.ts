// src/data/mock-data/recordings.ts
import type { Recording } from '@/types';
import recordingsDataJson from './json/recordings.json';
import { generateUnsplashUrl } from '@/lib/utils'; // Import centralized helper


export const recordingsMockData: Recording[] = recordingsDataJson.map(rawRecordingData => {
  const { 
    id,
    djId,
    djName,
    title,
    album,
    year,
    type,
    aiHint: recAiHint,
    artwork, 
    genre,
    fanScore,
    totalPlays,
    description,
    addedDate
  } = rawRecordingData;

  const finalArtworkUrl = (artwork && artwork.startsWith('http'))
                          ? artwork
                          : generateUnsplashUrl(400, 400, recAiHint || title, "abstract music art");

  return {
    id,
    djId,
    djName,
    title,
    album,
    year: year || new Date().getFullYear(), // Fallback
    // @ts-ignore
    type: type as Recording['type'] || "Single", // Fallback
    artworkUrl: finalArtworkUrl,
    aiHint: recAiHint || title || "music album", // Ensure aiHint is populated
    genre: genre || "Electronic", // Fallback
    fanScore,
    totalPlays,
    description: description || `A captivating recording titled ${title}.`, // Fallback
    addedDate: addedDate || new Date().toISOString()
  };
});
