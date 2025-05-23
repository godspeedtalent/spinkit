
// src/app/api/venues/route.ts
import { NextResponse } from 'next/server';
import { VenueService } from '@/services/venueService';
import type { VenueFilters } from '@/types';

export const dynamic = 'force-dynamic';

const venueService = new VenueService();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '8', 10);

    const filters: VenueFilters = {};
    if (searchParams.get('location')) {
      filters.location = searchParams.get('location')!;
    }
    if (searchParams.get('minCapacity')) {
      filters.minCapacity = parseInt(searchParams.get('minCapacity')!, 10);
    }
    if (searchParams.get('minFanScore')) {
      filters.minFanScore = parseFloat(searchParams.get('minFanScore')!);
    }
    if (searchParams.has('genres')) { 
      filters.genres = searchParams.get('genres')!.split(',');
    }

    const venuesResponse = await venueService.getAllVenues(filters, { page, limit });
    return NextResponse.json(venuesResponse);
  } catch (error: any) {
    console.error("[API Error] /api/venues:", error);
    return NextResponse.json({ error: 'Failed to fetch venues', details: error.message }, { status: 500 });
  }
}

    