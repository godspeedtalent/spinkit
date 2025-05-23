// src/app/api/cities/[cityName]/route.ts
import { NextResponse } from 'next/server';
import { CityService } from '@/services/cityService';

const cityService = new CityService();

export async function GET(
  request: Request,
  { params }: { params: { cityName: string } }
) {
   const { searchParams } = new URL(request.url);
   const type = searchParams.get('type');

  try {
    if (type === 'list') {
      const cities = await cityService.getAllCitiesList();
      return NextResponse.json(cities);
    }

    const cityName = decodeURIComponent(params.cityName);
    const cityDetails = await cityService.getCityPageDetails(cityName);
    if (!cityDetails) {
      return NextResponse.json({ error: 'City details not found' }, { status: 404 });
    }
    return NextResponse.json(cityDetails);
  } catch (error) {
    console.error(`API Error fetching city ${params.cityName}:`, error);
    return NextResponse.json({ error: 'Failed to fetch city details' }, { status: 500 });
  }
}
