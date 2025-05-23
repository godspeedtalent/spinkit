// src/app/api/recordings/[id]/route.ts
import { NextResponse } from 'next/server';
import { RecordingService } from '@/services/recordingService';

const recordingService = new RecordingService();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const recording = await recordingService.getRecordingById(params.id);
    if (!recording) {
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 });
    }
    return NextResponse.json(recording);
  } catch (error) {
    console.error(`API Error fetching recording ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch recording details' }, { status: 500 });
  }
}
