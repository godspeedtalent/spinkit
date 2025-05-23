
// src/app/api/djs/route.ts
import { NextResponse } from 'next/server';
import { DjService } from '@/services/djService';
import type { DjFilters } from '@/types';

export const dynamic = 'force-dynamic';

const djService = new DjService();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '8', 10);

    const filters: DjFilters = {};
    if (searchParams.has('genres')) {
      filters.genres = searchParams.get('genres')!.split(',');
    }
    if (searchParams.get('location')) {
      filters.location = searchParams.get('location')!;
    }
    if (searchParams.get('minScore')) {
      filters.minScore = parseInt(searchParams.get('minScore')!, 10);
    }
    if (searchParams.get('maxScore')) { // Ensure this is parsed if present
      filters.maxScore = parseInt(searchParams.get('maxScore')!, 10);
    }
    
    const djsResponse = await djService.getAllDjs(filters, { page, limit });
    return NextResponse.json(djsResponse);
  } catch (error: any) {
    console.error("[API Error] /api/djs:", error);
    return NextResponse.json({ error: 'Failed to fetch DJs', details: error.message }, { status: 500 });
  }
}

    