// src/app/api/djs/[id]/route.ts
import { NextResponse } from 'next/server';
import { DjService } from '@/services/djService';

const djService = new DjService();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const dj = await djService.getDjById(params.id);
    if (!dj) {
      return NextResponse.json({ error: 'DJ not found' }, { status: 404 });
    }
    return NextResponse.json(dj);
  } catch (error) {
    console.error(`API Error fetching DJ ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch DJ details' }, { status: 500 });
  }
}
