import { NextRequest, NextResponse } from 'next/server';
import { searchDestination } from '@/lib/biteship';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const keyword = searchParams.get('keyword');

  if (!keyword) {
    return NextResponse.json(
      { status: 'error', message: 'Keyword is required' },
      { status: 400 }
    );
  }

  try {
    const destinations = await searchDestination(keyword);
    return NextResponse.json({ status: 'success', data: destinations });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to search destination' },
      { status: 500 }
    );
  }
}
