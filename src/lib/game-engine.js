/**
 * game-engine.js — Core Wend game logic
 * Pure functions, no framework dependencies.
 * Handles path validation, word checking, hints, and state management.
 */

// Check if two cells are orthogonally adjacent
export function isAdjacent(cellA, cellB) {
  const [r1, c1] = cellA;
  const [r2, c2] = cellB;
  return (Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1;
}

// Validate that a path follows adjacency rules (no diagonals, connected)
export function validatePath(path) {
  if (!path || path.length < 2) return path && path.length === 1;
  for (let i = 1; i < path.length; i++) {
    if (!isAdjacent(path[i - 1], path[i])) return false;
  }
  // Check no duplicate cells
  const seen = new Set();
  for (const [r, c] of path) {
    const key = `${r},${c}`;
    if (seen.has(key)) return false;
    seen.add(key);
  }
  return true;
}

// Check if a traced path matches a solution word
export function checkWord(path, puzzle) {
  if (!validatePath(path)) return null;

  for (let i = 0; i < puzzle.words.length; i++) {
    const wordData = puzzle.words[i];
    if (wordData.path.length !== path.length) continue;

    // Check if path matches exactly
    let matches = true;
    for (let j = 0; j < path.length; j++) {
      if (path[j][0] !== wordData.path[j][0] || path[j][1] !== wordData.path[j][1]) {
        matches = false;
        break;
      }
    }
    if (matches) return { wordIndex: i, word: wordData.word };
  }
  return null;
}

// Get word color CSS variable for a word index
export function getWordColor(wordIndex) {
  const colors = [
    'var(--color-word-1)',
    'var(--color-word-2)',
    'var(--color-word-3)',
    'var(--color-word-4)',
    'var(--color-word-5)',
    'var(--color-word-6)',
    'var(--color-word-7)',
  ];
  return colors[wordIndex % colors.length];
}

export function getWordBgColor(wordIndex) {
  const colors = [
    'var(--color-word-1-bg)',
    'var(--color-word-2-bg)',
    'var(--color-word-3-bg)',
    'var(--color-word-4-bg)',
    'var(--color-word-5-bg)',
    'var(--color-word-6-bg)',
    'var(--color-word-7-bg)',
  ];
  return colors[wordIndex % colors.length];
}

// Raw hex colors for SVG rendering
const WORD_COLORS_HEX = [
  '#2D6A4F', '#E76F51', '#2563EB', '#D4A017', '#9B4DCA', '#0D9488', '#C04040'
];

export function getWordColorHex(wordIndex) {
  return WORD_COLORS_HEX[wordIndex % WORD_COLORS_HEX.length];
}

// Check if all words have been found
export function isComplete(foundWords, totalWords) {
  return foundWords.length === totalWords;
}

// Get a hint: reveal the first letter of a random unsolved word
export function getHint(puzzle, foundWordIndices) {
  const unsolved = puzzle.words
    .map((w, i) => ({ ...w, index: i }))
    .filter((_, i) => !foundWordIndices.includes(i));

  if (unsolved.length === 0) return null;

  const word = unsolved[Math.floor(Math.random() * unsolved.length)];
  return {
    wordIndex: word.index,
    cell: word.path[0],
    letter: word.word[0],
  };
}

// Check if a cell is part of any found word
export function isCellFound(row, col, foundWords, puzzle) {
  for (const idx of foundWords) {
    const word = puzzle.words[idx];
    for (const [r, c] of word.path) {
      if (r === row && c === col) return { wordIndex: idx };
    }
  }
  return null;
}

// Check if a cell is a wall
export function isWall(row, col, puzzle) {
  return puzzle.grid[row][col] === '#';
}

// Format time as M:SS
export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Generate SVG path data for a word path (smooth curves through cell centers)
export function generatePathSVG(path, gridSize, boardSize) {
  if (!path || path.length < 2) return '';

  const cellSize = boardSize / gridSize;
  const points = path.map(([r, c]) => ({
    x: c * cellSize + cellSize / 2,
    y: r * cellSize + cellSize / 2,
  }));

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x} ${points[i].y}`;
  }
  return d;
}

// Save game state to localStorage
export function saveGameState(puzzleId, state) {
  if (typeof window === 'undefined') return;
  try {
    const key = `wend-state-${puzzleId}`;
    localStorage.setItem(key, JSON.stringify(state));
  } catch (e) {
    // localStorage may be full or unavailable
  }
}

// Load game state from localStorage
export function loadGameState(puzzleId) {
  if (typeof window === 'undefined') return null;
  try {
    const key = `wend-state-${puzzleId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

// Save completion record
export function saveCompletion(puzzleId, time, hints) {
  if (typeof window === 'undefined') return;
  try {
    const completions = JSON.parse(localStorage.getItem('wend-completions') || '{}');
    completions[puzzleId] = { time, hints, completedAt: new Date().toISOString() };
    localStorage.setItem('wend-completions', JSON.stringify(completions));
  } catch (e) {}
}

// Get all completions
export function getCompletions() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem('wend-completions') || '{}');
  } catch (e) {
    return {};
  }
}

// Get stats for unlimited mode
export function getStats() {
  if (typeof window === 'undefined') return { played: 0, avgTime: 0, bestTime: 0 };
  try {
    const completions = getCompletions();
    const unlimitedGames = Object.entries(completions)
      .filter(([key]) => key.startsWith('unlimited-'));

    if (unlimitedGames.length === 0) return { played: 0, avgTime: 0, bestTime: 0 };

    const times = unlimitedGames.map(([, v]) => v.time).filter(t => t > 0);
    return {
      played: unlimitedGames.length,
      avgTime: times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0,
      bestTime: times.length > 0 ? Math.min(...times) : 0,
    };
  } catch (e) {
    return { played: 0, avgTime: 0, bestTime: 0 };
  }
}
