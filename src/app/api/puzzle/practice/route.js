import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const difficulty = searchParams.get('difficulty');

  try {
    const practiceDir = path.join(process.cwd(), 'data', 'practice');
    
    if (difficulty) {
      const filePath = path.join(practiceDir, `${difficulty}.json`);
      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: 'Invalid difficulty' }, { status: 404 });
      }
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return NextResponse.json(data);
    }

    // Return all practice puzzles
    const allPuzzles = {};
    for (const diff of ['easy', 'moderate', 'hard', 'expert']) {
      const filePath = path.join(practiceDir, `${diff}.json`);
      if (fs.existsSync(filePath)) {
        allPuzzles[diff] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
    }
    return NextResponse.json(allPuzzles);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to load puzzles' }, { status: 500 });
  }
}
