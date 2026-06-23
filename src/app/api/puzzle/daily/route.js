import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const size = searchParams.get('size');

  if (!date || !size) {
    return NextResponse.json({ error: 'Missing date or size parameter' }, { status: 400 });
  }

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
  }

  // Validate grid size
  const validSizes = ['5x5', '6x6', '7x7', '8x8', '9x9', '10x10'];
  if (!validSizes.includes(size)) {
    return NextResponse.json({ error: 'Invalid grid size' }, { status: 400 });
  }

  try {
    const filePath = path.join(process.cwd(), 'data', 'daily', `${date}.json`);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'No puzzle for this date' }, { status: 404 });
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const puzzle = data[size];

    if (!puzzle) {
      return NextResponse.json({ error: 'No puzzle for this size' }, { status: 404 });
    }

    return NextResponse.json(puzzle, {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to load puzzle' }, { status: 500 });
  }
}
