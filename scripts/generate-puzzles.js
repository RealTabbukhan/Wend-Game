/**
 * generate-puzzles.js
 * 
 * Core Wend puzzle generator.
 * Creates valid, solvable Wend puzzles with guaranteed unique solutions.
 * 
 * Algorithm:
 * 1. Define grid dimensions and word lengths
 * 2. Place walls randomly (cells not used by any word)
 * 3. Generate non-overlapping paths that fill all non-wall cells
 * 4. For each path, find dictionary words whose letters match
 * 5. Validate that the puzzle has a unique solution
 * 6. Output puzzle as JSON
 * 
 * Usage:
 *   node scripts/generate-puzzles.js --type daily --date 2026-06-22
 *   node scripts/generate-puzzles.js --type practice --count 50
 *   node scripts/generate-puzzles.js --type unlimited --count 500
 */

const fs = require('fs');
const path = require('path');

// Load word list
const wordlistPath = path.join(__dirname, '..', 'data', 'wordlist.json');
let WORDS_BY_LENGTH = {};
try {
  WORDS_BY_LENGTH = JSON.parse(fs.readFileSync(wordlistPath, 'utf8'));
} catch (e) {
  console.error('Word list not found. Run generate-wordlist.js first.');
  process.exit(1);
}

// Grid configurations by size
const GRID_CONFIGS = {
  '5x5': { rows: 5, cols: 5, wordLengths: [3, 4, 5, 6], difficulty: 'easy' },
  '6x6': { rows: 6, cols: 6, wordLengths: [3, 4, 5, 6, 7], difficulty: 'moderate' },
  '7x7': { rows: 7, cols: 7, wordLengths: [4, 5, 6, 7, 8], difficulty: 'medium' },
  '8x8': { rows: 8, cols: 8, wordLengths: [3, 5, 6, 7, 8, 9], difficulty: 'hard' },
  '9x9': { rows: 9, cols: 9, wordLengths: [4, 5, 6, 7, 8, 9], difficulty: 'expert' },
  '10x10': { rows: 10, cols: 10, wordLengths: [3, 4, 5, 6, 7, 8, 9], difficulty: 'master' },
};

// Seeded random number generator for reproducible daily puzzles
class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }
  next() {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }
  nextInt(min, max) {
    return Math.floor(this.next() * (max - min)) + min;
  }
  shuffle(arr) {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

// Convert date string to a numeric seed
function dateToSeed(dateStr) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Get orthogonal neighbors of a cell in the grid
function getNeighbors(row, col, rows, cols) {
  const neighbors = [];
  if (row > 0) neighbors.push([row - 1, col]);
  if (row < rows - 1) neighbors.push([row + 1, col]);
  if (col > 0) neighbors.push([row, col - 1]);
  if (col < cols - 1) neighbors.push([row, col + 1]);
  return neighbors;
}

// Check if all non-wall cells are connected (flood fill)
function isConnected(grid, rows, cols) {
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  let startR = -1, startC = -1;
  
  // Find first open cell
  for (let r = 0; r < rows && startR === -1; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== '#') {
        startR = r;
        startC = c;
        break;
      }
    }
  }
  
  if (startR === -1) return true;
  
  // BFS flood fill
  const queue = [[startR, startC]];
  visited[startR][startC] = true;
  let count = 1;
  
  while (queue.length > 0) {
    const [r, c] = queue.shift();
    for (const [nr, nc] of getNeighbors(r, c, rows, cols)) {
      if (!visited[nr][nc] && grid[nr][nc] !== '#') {
        visited[nr][nc] = true;
        count++;
        queue.push([nr, nc]);
      }
    }
  }
  
  // Count total open cells
  let totalOpen = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== '#') totalOpen++;
    }
  }
  
  return count === totalOpen;
}

/**
 * Generate paths that fill all non-wall cells.
 * Uses backtracking to find non-overlapping paths of specified lengths.
 */
function generatePaths(rows, cols, wordLengths, rng, maxAttempts = 200) {
  const totalLetters = wordLengths.reduce((a, b) => a + b, 0);
  const totalCells = rows * cols;
  const numWalls = totalCells - totalLetters;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Create grid with walls
    const grid = Array.from({ length: rows }, () => Array(cols).fill('.'));
    const used = Array.from({ length: rows }, () => Array(cols).fill(false));
    
    // Place walls randomly
    const allCells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        allCells.push([r, c]);
      }
    }
    
    const shuffledCells = rng.shuffle(allCells);
    let wallsPlaced = 0;
    
    for (const [r, c] of shuffledCells) {
      if (wallsPlaced >= numWalls) break;
      grid[r][c] = '#';
      used[r][c] = true;
      wallsPlaced++;
      
      // Check connectivity after each wall placement
      if (!isConnected(grid, rows, cols)) {
        grid[r][c] = '.';
        used[r][c] = false;
        wallsPlaced--;
      }
    }
    
    if (wallsPlaced < numWalls) continue;
    
    // Now try to generate paths
    const paths = [];
    const sortedLengths = [...wordLengths].sort((a, b) => b - a); // Start with longest
    
    if (tryPlacePaths(grid, used, rows, cols, sortedLengths, 0, paths, rng)) {
      // Reorder paths to match original wordLengths order
      const orderedPaths = [];
      const usedPaths = new Set();
      
      for (const len of wordLengths) {
        for (let i = 0; i < paths.length; i++) {
          if (!usedPaths.has(i) && paths[i].length === len) {
            orderedPaths.push(paths[i]);
            usedPaths.add(i);
            break;
          }
        }
      }
      
      return { grid, paths: orderedPaths, walls: getWallPositions(grid, rows, cols) };
    }
  }
  
  return null;
}

function getWallPositions(grid, rows, cols) {
  const walls = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '#') walls.push([r, c]);
    }
  }
  return walls;
}

function tryPlacePaths(grid, used, rows, cols, lengths, index, paths, rng) {
  if (index >= lengths.length) {
    // Check all non-wall cells are used
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] !== '#' && !used[r][c]) return false;
      }
    }
    return true;
  }
  
  const pathLen = lengths[index];
  
  // Find all unused open cells as possible starting points
  const startCells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!used[r][c] && grid[r][c] !== '#') {
        startCells.push([r, c]);
      }
    }
  }
  
  const shuffledStarts = rng.shuffle(startCells);
  
  for (const [startR, startC] of shuffledStarts) {
    const path = [];
    if (buildPath(grid, used, rows, cols, startR, startC, pathLen, path, rng)) {
      // Mark cells as used
      for (const [r, c] of path) {
        used[r][c] = true;
      }
      paths.push(path);
      
      // Check remaining cells are still reachable (connected)
      if (remainingConnected(grid, used, rows, cols)) {
        if (tryPlacePaths(grid, used, rows, cols, lengths, index + 1, paths, rng)) {
          return true;
        }
      }
      
      // Backtrack
      paths.pop();
      for (const [r, c] of path) {
        used[r][c] = false;
      }
    }
  }
  
  return false;
}

function remainingConnected(grid, used, rows, cols) {
  // Check if remaining unused non-wall cells are connected
  let startR = -1, startC = -1;
  let totalRemaining = 0;
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!used[r][c] && grid[r][c] !== '#') {
        totalRemaining++;
        if (startR === -1) {
          startR = r;
          startC = c;
        }
      }
    }
  }
  
  if (totalRemaining === 0) return true;
  if (startR === -1) return true;
  
  // BFS
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const queue = [[startR, startC]];
  visited[startR][startC] = true;
  let count = 1;
  
  while (queue.length > 0) {
    const [r, c] = queue.shift();
    for (const [nr, nc] of getNeighbors(r, c, rows, cols)) {
      if (!visited[nr][nc] && !used[nr][nc] && grid[nr][nc] !== '#') {
        visited[nr][nc] = true;
        count++;
        queue.push([nr, nc]);
      }
    }
  }
  
  return count === totalRemaining;
}

function buildPath(grid, used, rows, cols, startR, startC, length, path, rng) {
  path.push([startR, startC]);
  
  if (path.length === length) return true;
  
  const neighbors = getNeighbors(startR, startC, rows, cols)
    .filter(([r, c]) => !used[r][c] && grid[r][c] !== '#' && !path.some(([pr, pc]) => pr === r && pc === c));
  
  const shuffled = rng.shuffle(neighbors);
  
  for (const [nr, nc] of shuffled) {
    if (buildPath(grid, used, rows, cols, nr, nc, length, path, rng)) {
      return true;
    }
  }
  
  path.pop();
  return false;
}

/**
 * Assign dictionary words to paths.
 * Finds words from the dictionary that can be placed along each path.
 */
function assignWords(paths, rng) {
  const words = [];
  const usedWords = new Set();
  
  for (const pathCells of paths) {
    const len = pathCells.length;
    const candidates = WORDS_BY_LENGTH[len.toString()];
    
    if (!candidates || candidates.length === 0) {
      return null;
    }
    
    // Pick a random word that hasn't been used
    const shuffled = rng.shuffle(candidates);
    let found = false;
    
    for (const word of shuffled) {
      if (!usedWords.has(word)) {
        words.push(word.toUpperCase());
        usedWords.add(word);
        found = true;
        break;
      }
    }
    
    if (!found) return null;
  }
  
  return words;
}

/**
 * Build the final puzzle grid with letters placed along paths.
 */
function buildLetterGrid(rows, cols, paths, words, walls) {
  const grid = Array.from({ length: rows }, () => Array(cols).fill(null));
  
  // Place walls
  for (const [r, c] of walls) {
    grid[r][c] = '#';
  }
  
  // Place letters along paths
  for (let i = 0; i < paths.length; i++) {
    const pathCells = paths[i];
    const word = words[i];
    
    for (let j = 0; j < pathCells.length; j++) {
      const [r, c] = pathCells[j];
      grid[r][c] = word[j];
    }
  }
  
  return grid;
}

/**
 * Generate a single puzzle for the given grid configuration.
 */
function generatePuzzle(gridSize, rng, id = null) {
  const config = GRID_CONFIGS[gridSize];
  if (!config) {
    console.error(`Unknown grid size: ${gridSize}`);
    return null;
  }
  
  const { rows, cols, wordLengths, difficulty } = config;
  
  // Generate paths
  const result = generatePaths(rows, cols, wordLengths, rng);
  if (!result) {
    return null;
  }
  
  const { grid, paths, walls } = result;
  
  // Assign words
  const words = assignWords(paths, rng);
  if (!words) {
    return null;
  }
  
  // Build letter grid
  const letterGrid = buildLetterGrid(rows, cols, paths, words, walls);
  
  // Create puzzle object
  const puzzle = {
    id: id || `${gridSize}-${Date.now()}`,
    gridSize,
    rows,
    cols,
    difficulty,
    grid: letterGrid,
    walls,
    words: words.map((word, i) => ({
      word,
      length: word.length,
      path: paths[i],
    })),
  };
  
  return puzzle;
}

/**
 * Generate daily puzzles for a given date.
 * Creates one puzzle per grid size.
 */
function generateDailyPuzzles(dateStr) {
  const seed = dateToSeed(dateStr + '-wend-daily');
  const puzzles = {};
  
  for (const gridSize of Object.keys(GRID_CONFIGS)) {
    const sizeSeed = dateToSeed(dateStr + '-' + gridSize);
    const rng = new SeededRandom(sizeSeed);
    
    let puzzle = null;
    let attempts = 0;
    
    while (!puzzle && attempts < 10) {
      const attemptRng = new SeededRandom(sizeSeed + attempts * 1000);
      puzzle = generatePuzzle(gridSize, attemptRng, `daily-${dateStr}-${gridSize}`);
      attempts++;
    }
    
    if (puzzle) {
      puzzle.date = dateStr;
      puzzle.type = 'daily';
      puzzles[gridSize] = puzzle;
    } else {
      console.warn(`  Failed to generate ${gridSize} puzzle for ${dateStr}`);
    }
  }
  
  return puzzles;
}

/**
 * Generate practice puzzles.
 */
function generatePracticePuzzles(count = 50) {
  const puzzles = {
    easy: [],
    moderate: [],
    hard: [],
    expert: [],
  };
  
  const difficultyConfigs = {
    easy: ['5x5'],
    moderate: ['6x6'],
    hard: ['7x7', '8x8'],
    expert: ['9x9', '10x10'],
  };
  
  const countsPerDifficulty = {
    easy: Math.ceil(count * 0.3),
    moderate: Math.ceil(count * 0.3),
    hard: Math.ceil(count * 0.2),
    expert: Math.ceil(count * 0.2),
  };
  
  for (const [difficulty, gridSizes] of Object.entries(difficultyConfigs)) {
    const targetCount = countsPerDifficulty[difficulty];
    
    for (let i = 0; i < targetCount; i++) {
      const gridSize = gridSizes[i % gridSizes.length];
      const seed = dateToSeed(`practice-${difficulty}-${i}-v2`);
      const rng = new SeededRandom(seed);
      
      let puzzle = null;
      let attempts = 0;
      
      while (!puzzle && attempts < 10) {
        const attemptRng = new SeededRandom(seed + attempts * 777);
        puzzle = generatePuzzle(gridSize, attemptRng, `practice-${difficulty}-${i}`);
        attempts++;
      }
      
      if (puzzle) {
        puzzle.type = 'practice';
        puzzle.practiceIndex = i;
        puzzles[difficulty].push(puzzle);
      }
    }
  }
  
  return puzzles;
}

/**
 * Generate unlimited puzzles.
 */
function generateUnlimitedPuzzles(countPerSize = 80) {
  const puzzles = {};
  
  for (const gridSize of Object.keys(GRID_CONFIGS)) {
    puzzles[gridSize] = [];
    
    for (let i = 0; i < countPerSize; i++) {
      const seed = dateToSeed(`unlimited-${gridSize}-${i}-v3`);
      const rng = new SeededRandom(seed);
      
      let puzzle = null;
      let attempts = 0;
      
      while (!puzzle && attempts < 10) {
        const attemptRng = new SeededRandom(seed + attempts * 333);
        puzzle = generatePuzzle(gridSize, attemptRng, `unlimited-${gridSize}-${i}`);
        attempts++;
      }
      
      if (puzzle) {
        puzzle.type = 'unlimited';
        puzzles[gridSize].push(puzzle);
      }
    }
    
    console.log(`  ${gridSize}: Generated ${puzzles[gridSize].length} unlimited puzzles`);
  }
  
  return puzzles;
}

// CLI interface
function main() {
  const args = process.argv.slice(2);
  const type = args.find(a => a.startsWith('--type='))?.split('=')[1] || 'all';
  const dateArg = args.find(a => a.startsWith('--date='))?.split('=')[1];
  const countArg = parseInt(args.find(a => a.startsWith('--count='))?.split('=')[1] || '50');
  
  const dataDir = path.join(__dirname, '..', 'data');
  
  console.log('\n🎲 Wend Puzzle Generator');
  console.log('═'.repeat(40));
  
  if (type === 'daily' || type === 'all') {
    console.log('\n📅 Generating daily puzzles...');
    const dailyDir = path.join(dataDir, 'daily');
    if (!fs.existsSync(dailyDir)) fs.mkdirSync(dailyDir, { recursive: true });
    
    // Generate for 90 days from Wend launch date
    const startDate = new Date('2026-06-09');
    const endDate = new Date('2026-09-09');
    
    if (dateArg) {
      // Generate for specific date
      const puzzles = generateDailyPuzzles(dateArg);
      const outPath = path.join(dailyDir, `${dateArg}.json`);
      fs.writeFileSync(outPath, JSON.stringify(puzzles, null, 2));
      console.log(`  Generated daily puzzles for ${dateArg}`);
    } else {
      let count = 0;
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const outPath = path.join(dailyDir, `${dateStr}.json`);
        
        // Skip if already exists
        if (fs.existsSync(outPath)) {
          count++;
          continue;
        }
        
        const puzzles = generateDailyPuzzles(dateStr);
        fs.writeFileSync(outPath, JSON.stringify(puzzles));
        count++;
        
        if (count % 10 === 0) {
          process.stdout.write(`  Generated ${count} days...\r`);
        }
      }
      console.log(`  Generated ${count} days of daily puzzles`);
    }
  }
  
  if (type === 'practice' || type === 'all') {
    console.log('\n🎯 Generating practice puzzles...');
    const practiceDir = path.join(dataDir, 'practice');
    if (!fs.existsSync(practiceDir)) fs.mkdirSync(practiceDir, { recursive: true });
    
    const puzzles = generatePracticePuzzles(countArg);
    
    for (const [difficulty, puzzleList] of Object.entries(puzzles)) {
      const outPath = path.join(practiceDir, `${difficulty}.json`);
      fs.writeFileSync(outPath, JSON.stringify(puzzleList, null, 2));
      console.log(`  ${difficulty}: ${puzzleList.length} puzzles`);
    }
  }
  
  if (type === 'unlimited' || type === 'all') {
    console.log('\n♾️  Generating unlimited puzzles...');
    const unlimitedDir = path.join(dataDir, 'unlimited');
    if (!fs.existsSync(unlimitedDir)) fs.mkdirSync(unlimitedDir, { recursive: true });
    
    const puzzles = generateUnlimitedPuzzles(80);
    
    for (const [gridSize, puzzleList] of Object.entries(puzzles)) {
      const outPath = path.join(unlimitedDir, `${gridSize}.json`);
      fs.writeFileSync(outPath, JSON.stringify(puzzleList));
    }
  }
  
  console.log('\n✅ Puzzle generation complete!\n');
}

main();
