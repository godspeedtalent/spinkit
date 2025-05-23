
// src/app/api/recordings/route.ts
import { NextResponse } from 'next/server';
import { RecordingService } from '@/services/recordingService';
import type { RecordingFilters } from '@/types';

export const dynamic = 'force-dynamic';
const recordingService = new RecordingService();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '8', 10);

    const filters: RecordingFilters = {};
    if (searchParams.has('genres')) {
      filters.genres = searchParams.get('genres')!.split(',');
    }
    
    const recordingsResponse = await recordingService.getAllRecordings(filters, { page, limit });
    return NextResponse.json(recordingsResponse);
  } catch (error: any) {
    console.error("[API Error] /api/recordings:", error);
    return NextResponse.json({ error: 'Failed to fetch recordings', details: error.message }, { status: 500 });
  }
}

    