// src/app/api/genres/[genreName]/route.ts
import { NextResponse } from 'next/server';
import { GenreService } from '@/services/genreService';

const genreService = new GenreService();

export async function GET(
  request: Request,
  { params }: { params: { genreName: string } }
) {
  try {
    const genreName = decodeURIComponent(params.genreName);
    const genreDetails = await genreService.getGenreDetails(genreName);
    if (!genreDetails) {
      return NextResponse.json({ error: 'Genre not found' }, { status: 404 });
    }
    return NextResponse.json(genreDetails);
  } catch (error) {
    console.error(`API Error fetching genre ${params.genreName}:`, error);
    return NextResponse.json({ error: 'Failed to fetch genre details' }, { status: 500 });
  }
}
