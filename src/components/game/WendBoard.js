'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  checkWord, isAdjacent, isCellFound, isWall, getWordColor, getWordColorHex,
  getWordBgColor, formatTime, generatePathSVG, getHint,
  saveGameState, loadGameState, saveCompletion, isComplete
} from '@/lib/game-engine';

export default function WendBoard({ puzzle, onComplete }) {
  const [foundWords, setFoundWords] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintCells, setHintCells] = useState([]);
  const [showWin, setShowWin] = useState(false);
  const [shakeCell, setShakeCell] = useState(null);
  const boardRef = useRef(null);
  const timerRef = useRef(null);

  const { rows, cols, grid, words } = puzzle;

  // Load saved state
  useEffect(() => {
    const saved = loadGameState(puzzle.id);
    if (saved) {
      setFoundWords(saved.foundWords || []);
      setTimer(saved.timer || 0);
      setHintsUsed(saved.hintsUsed || 0);
      setHintCells(saved.hintCells || []);
      if (saved.foundWords && saved.foundWords.length === words.length) {
        setShowWin(true);
      } else {
        setIsRunning(true);
      }
    } else {
      setIsRunning(true);
    }
  }, [puzzle.id, words.length]);

  // Timer
  useEffect(() => {
    if (isRunning && !showWin) {
      timerRef.current = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, showWin]);

  // Save state on changes
  useEffect(() => {
    if (foundWords.length > 0 || timer > 0) {
      saveGameState(puzzle.id, { foundWords, timer, hintsUsed, hintCells });
    }
  }, [foundWords, timer, hintsUsed, hintCells, puzzle.id]);

  // Get cell position from pointer event
  const getCellFromEvent = useCallback((e) => {
    if (!boardRef.current) return null;
    const rect = boardRef.current.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    const cellW = rect.width / cols;
    const cellH = rect.height / rows;
    const col = Math.floor(x / cellW);
    const row = Math.floor(y / cellH);
    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      return [row, col];
    }
    return null;
  }, [rows, cols]);

  // Handle pointer events for drag-to-trace
  const handlePointerDown = useCallback((row, col) => {
    if (isWall(row, col, puzzle)) return;
    if (isCellFound(row, col, foundWords, puzzle)) return;

    setIsDragging(true);
    setCurrentPath([[row, col]]);
  }, [puzzle, foundWords]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();

    const cell = getCellFromEvent(e);
    if (!cell) return;
    const [row, col] = cell;

    if (isWall(row, col, puzzle)) return;
    if (isCellFound(row, col, foundWords, puzzle)) return;

    // Check if already in path
    const existingIdx = currentPath.findIndex(([r, c]) => r === row && c === col);
    if (existingIdx === currentPath.length - 1) return; // Same cell
    if (existingIdx >= 0) {
      // Backtrack
      setCurrentPath(currentPath.slice(0, existingIdx + 1));
      return;
    }

    // Must be adjacent to last cell
    const last = currentPath[currentPath.length - 1];
    if (last && isAdjacent(last, [row, col])) {
      setCurrentPath([...currentPath, [row, col]]);
    }
  }, [isDragging, currentPath, puzzle, foundWords, getCellFromEvent]);

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    if (currentPath.length >= 2) {
      const result = checkWord(currentPath, puzzle);
      if (result && !foundWords.includes(result.wordIndex)) {
        const newFound = [...foundWords, result.wordIndex];
        setFoundWords(newFound);

        if (isComplete(newFound, words.length)) {
          setIsRunning(false);
          setShowWin(true);
          saveCompletion(puzzle.id, timer, hintsUsed);
          if (onComplete) onComplete({ time: timer, hints: hintsUsed });
        }
      }
    }
    setCurrentPath([]);
  }, [isDragging, currentPath, puzzle, foundWords, words.length, timer, hintsUsed, onComplete]);

  // Touch events for mobile
  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    const onTouchMove = (e) => {
      if (isDragging) {
        e.preventDefault();
        handlePointerMove(e);
      }
    };

    board.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => board.removeEventListener('touchmove', onTouchMove);
  }, [isDragging, handlePointerMove]);

  // Hint
  const handleHint = () => {
    const hint = getHint(puzzle, foundWords);
    if (hint) {
      setHintsUsed(h => h + 1);
      setHintCells(prev => [...prev, { row: hint.cell[0], col: hint.cell[1], wordIndex: hint.wordIndex }]);
    }
  };

  // Undo last found word
  const handleUndo = () => {
    if (foundWords.length > 0) {
      setFoundWords(foundWords.slice(0, -1));
    }
  };

  // Reset entire puzzle
  const handleReset = () => {
    setFoundWords([]);
    setCurrentPath([]);
    setTimer(0);
    setHintsUsed(0);
    setHintCells([]);
    setShowWin(false);
    setIsRunning(true);
    saveGameState(puzzle.id, { foundWords: [], timer: 0, hintsUsed: 0, hintCells: [] });
  };

  // Check if cell is in current drag path
  const isInCurrentPath = (row, col) => {
    return currentPath.some(([r, c]) => r === row && c === col);
  };

  // Get cell styling
  const getCellStyle = (row, col) => {
    const found = isCellFound(row, col, foundWords, puzzle);
    if (found) {
      return {
        backgroundColor: getWordColor(found.wordIndex),
        borderColor: 'transparent',
        color: '#fff',
      };
    }
    if (isInCurrentPath(row, col)) {
      return {
        backgroundColor: 'var(--color-accent)',
        borderColor: 'var(--color-accent)',
        color: '#fff',
      };
    }
    // Check if this is a hint cell
    const hintCell = hintCells.find(h => h.row === row && h.col === col);
    if (hintCell) {
      return {
        backgroundColor: getWordBgColor(hintCell.wordIndex),
        borderColor: getWordColor(hintCell.wordIndex),
      };
    }
    return {};
  };

  // Generate SVG paths for found words
  const renderFoundPaths = () => {
    const boardSize = 100; // viewBox size
    return foundWords.map(idx => {
      const word = words[idx];
      const d = generatePathSVG(word.path, Math.max(rows, cols), boardSize);
      return (
        <path
          key={idx}
          d={d}
          stroke={getWordColorHex(idx)}
          strokeWidth={boardSize / Math.max(rows, cols) * 0.55}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.25"
        />
      );
    });
  };

  // Render current drag path
  const renderCurrentDragPath = () => {
    if (currentPath.length < 2) return null;
    const boardSize = 100;
    const d = generatePathSVG(currentPath, Math.max(rows, cols), boardSize);
    return (
      <path
        d={d}
        stroke="var(--color-accent)"
        strokeWidth={boardSize / Math.max(rows, cols) * 0.55}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.3"
      />
    );
  };

  return (
    <div className="game-container">
      {/* Game Header */}
      <div className="game-header">
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)' }}>
            {puzzle.type === 'daily' && `Wend #${puzzle.id.split('-').pop()}`}
            {puzzle.type === 'practice' && `Practice ${puzzle.gridSize}`}
            {puzzle.type === 'unlimited' && `Unlimited ${puzzle.gridSize}`}
            {!puzzle.type && `Wend ${puzzle.gridSize}`}
          </h2>
          {puzzle.date && (
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              {new Date(puzzle.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          )}
        </div>
        <div className="game-meta">
          <div className="game-timer" aria-label="Elapsed time">{formatTime(timer)}</div>
          <div>{foundWords.length}/{words.length} found</div>
        </div>
      </div>

      {/* Game Board */}
      <div
        ref={boardRef}
        className="board-wrapper"
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchEnd={handlePointerUp}
        role="grid"
        aria-label="Wend letter grid"
        tabIndex={0}
      >
        {/* SVG Path overlay */}
        <svg
          className="path-overlay"
          viewBox={`0 0 100 100`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {renderFoundPaths()}
          {renderCurrentDragPath()}
        </svg>

        {/* Grid cells */}
        <div
          className="board-grid"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const wall = cell === '#';
              const found = isCellFound(r, c, foundWords, puzzle);
              const inPath = isInCurrentPath(r, c);

              return (
                <div
                  key={`${r}-${c}`}
                  role={wall ? 'presentation' : 'gridcell'}
                  className={`board-cell ${wall ? 'board-cell--wall' : ''} ${found ? 'board-cell--found' : ''} ${inPath ? 'board-cell--selected' : ''}`}
                  style={wall ? {} : getCellStyle(r, c)}
                  onMouseDown={() => !wall && handlePointerDown(r, c)}
                  onTouchStart={(e) => {
                    if (!wall) {
                      e.preventDefault();
                      handlePointerDown(r, c);
                    }
                  }}
                  aria-label={wall ? undefined : `Row ${r + 1}, column ${c + 1}, letter ${cell}`}
                  data-row={r}
                  data-col={c}
                >
                  {!wall && <span>{cell}</span>}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Word List */}
      <div className="word-list" aria-label="Words to find">
        {words.map((wordData, idx) => {
          const isFound = foundWords.includes(idx);
          return (
            <div key={idx} className="word-row">
              <span className="word-label">{wordData.length} ltr</span>
              <div className="word-pills">
                {wordData.word.split('').map((letter, li) => (
                  <span
                    key={li}
                    className={`word-pill ${isFound ? 'word-pill--revealed' : ''}`}
                    style={isFound ? { backgroundColor: getWordColor(idx) } : {}}
                  >
                    {isFound ? letter : '\u00B7'}
                  </span>
                ))}
              </div>
              <svg className={`word-check ${isFound ? 'word-check--done' : ''}`} viewBox="0 0 20 20" fill="none">
                <path d="M4 10l4 4 8-8" stroke={isFound ? getWordColorHex(idx) : '#ccc'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="game-controls">
        <button className="btn btn-outline btn-sm" onClick={handleHint} disabled={foundWords.length === words.length}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
          Hint
        </button>
        <button className="btn btn-outline btn-sm" onClick={handleUndo} disabled={foundWords.length === 0}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>
          Undo
        </button>
        <button className="btn btn-outline btn-sm" onClick={handleReset} disabled={foundWords.length === 0 && timer === 0}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          Reset
        </button>
        <span className="auto-save">Progress saves automatically</span>
      </div>

      {/* Win Modal */}
      {showWin && (
        <div className="win-overlay" onClick={(e) => e.target === e.currentTarget && setShowWin(false)}>
          <div className="win-modal animate-slide-up">
            <h2>Puzzle Complete!</h2>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              You found all {words.length} words
            </p>
            <div className="stats">
              <div>
                <div className="stat-value">{formatTime(timer)}</div>
                <div className="stat-label">Time</div>
              </div>
              <div>
                <div className="stat-value">{hintsUsed}</div>
                <div className="stat-label">Hints used</div>
              </div>
            </div>
            <div className="win-actions">
              <button className="btn btn-accent" onClick={handleReset}>Play Again</button>
              <button className="btn btn-outline" onClick={() => setShowWin(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
