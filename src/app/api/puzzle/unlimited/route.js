import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const size = searchParams.get('size') || '5x5';

  const validSizes = ['5x5', '6x6', '7x7', '8x8', '9x9', '10x10'];
  if (!validSizes.includes(size)) {
    return NextResponse.json({ error: 'Invalid grid size' }, { status: 400 });
  }

  try {
    const filePath = path.join(process.cwd(), 'data', 'unlimited', `${size}.json`);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'No puzzles available' }, { status: 404 });
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Return a random puzzle
    const randomIndex = Math.floor(Math.random() * data.length);
    const puzzle = data[randomIndex];
    puzzle.id = `unlimited-${size}-${Date.now()}`;

    return NextResponse.json(puzzle);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to load puzzle' }, { status: 500 });
  }
}
