// src/app/api/genres/route.ts
import { NextResponse } from 'next/server';
import { GenreService } from '@/services/genreService';

const genreService = new GenreService();

export async function GET() {
  try {
    const genres = await genreService.getAllGenresList();
    return NextResponse.json(genres);
  } catch (error) {
    console.error("API Error fetching genres list:", error);
    return NextResponse.json({ error: 'Failed to fetch genres list' }, { status: 500 });
  }
}
