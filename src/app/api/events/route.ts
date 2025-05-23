
// src/app/api/events/route.ts
import { NextResponse } from 'next/server';
import { EventService } from '@/services/eventService';
import type { EventFilters } from '@/types';

export const dynamic = 'force-dynamic';
const eventService = new EventService();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    if (type === 'cities') {
      const cities = await eventService.getAllEventCities();
      return NextResponse.json(cities);
    }
    
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '8', 10);

    const filters: EventFilters = {};
    if (searchParams.has('genres')) {
      filters.genres = searchParams.get('genres')!.split(',');
    }
    if (searchParams.has('cities')) {
      filters.cities = searchParams.get('cities')!.split(',');
    }

    const eventsResponse = await eventService.getAllEvents(filters, { page, limit });
    return NextResponse.json(eventsResponse);

  } catch (error: any) {
    console.error("[API Error] /api/events:", error);
    return NextResponse.json({ error: 'Failed to fetch events', details: error.message }, { status: 500 });
  }
}

    