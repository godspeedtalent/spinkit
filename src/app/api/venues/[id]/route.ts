// src/app/api/venues/[id]/route.ts
import { NextResponse } from 'next/server';
import { VenueService } from '@/services/venueService';

const venueService = new VenueService();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const venue = await venueService.getVenueById(params.id);
    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }
    return NextResponse.json(venue);
  } catch (error) {
    console.error(`API Error fetching venue ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch venue details' }, { status: 500 });
  }
}
