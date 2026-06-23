'use client';

import { useState, useEffect } from 'react';
import { getWordColorHex } from '@/lib/game-engine';

export default function AnswersPage() {
  const [todayStr, setTodayStr] = useState('');
  const [puzzles, setPuzzles] = useState(null);
  const [selectedSize, setSelectedSize] = useState('5x5');
  const [showAnswers, setShowAnswers] = useState(false);
  const [loading, setLoading] = useState(true);

  const sizes = ['5x5', '6x6', '7x7', '8x8', '9x9', '10x10'];

  useEffect(() => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    setTodayStr(dateStr);

    // Load all sizes for today
    async function loadAll() {
      const results = {};
      for (const size of sizes) {
        try {
          const res = await fetch(`/api/puzzle/daily?date=${dateStr}&size=${size}`);
          if (res.ok) {
            results[size] = await res.json();
          }
        } catch (e) {}
      }
      setPuzzles(results);
      setLoading(false);
    }
    loadAll();
  }, []);

  const currentPuzzle = puzzles?.[selectedSize];

  const formattedDate = todayStr
    ? new Date(todayStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  // Render mini grid showing solution
  const renderSolutionGrid = (puzzle) => {
    if (!puzzle) return null;
    const { rows, cols, grid, words } = puzzle;
    const cellSize = 36;
    
    // Map each cell to its word index
    const cellToWord = {};
    words.forEach((w, idx) => {
      w.path.forEach(([r, c]) => {
        cellToWord[`${r},${c}`] = idx;
      });
    });

    return (
      <div style={{
        display: 'inline-grid',
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        gap: '2px',
        background: 'var(--color-grid-bg)',
        padding: '4px',
        borderRadius: 'var(--radius-md)',
      }}>
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const isWall = cell === '#';
            const wordIdx = cellToWord[`${r},${c}`];
            return (
              <div
                key={`${r}-${c}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: isWall ? 'var(--color-wall)' : (getWordColorHex(wordIdx)),
                  color: isWall ? 'transparent' : '#fff',
                }}
              >
                {!isWall && cell}
              </div>
            );
          })
        )}
      </div>
    );
  };

  return (
    <div className="container section">
      <div className="section-header">
        <h1>Today&apos;s Wend Answers</h1>
        <p>{formattedDate}</p>
      </div>

      {/* Warning */}
      <div className="card" style={{
        maxWidth: '600px', margin: '0 auto var(--space-2xl)',
        borderLeft: '4px solid var(--color-warning)',
        background: 'var(--color-surface)',
      }}>
        <p style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: '4px' }}>
          Spoiler Warning
        </p>
        <p style={{ fontSize: '0.9rem' }}>
          This page reveals today&apos;s puzzle answers. If you want to solve the puzzle
          yourself first, <a href="/">play today&apos;s challenge here</a>.
        </p>
      </div>

      {/* Size tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
        {sizes.map(size => (
          <button
            key={size}
            className={`filter-btn ${selectedSize === size ? 'filter-btn--active' : ''}`}
            onClick={() => { setSelectedSize(size); setShowAnswers(false); }}
          >
            {size}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading answers...</p>
      ) : currentPuzzle ? (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          {/* Hints section (always visible) */}
          <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-md)' }}>
              Hints — {selectedSize} Grid
            </h2>
            {currentPuzzle.words.map((w, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
                padding: '8px 0',
                borderBottom: i < currentPuzzle.words.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}>
                <span style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: getWordColorHex(i), color: '#fff',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                }}>
                  {i + 1}
                </span>
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  {w.length} letters — starts with <strong>&quot;{w.word[0]}&quot;</strong>
                </span>
              </div>
            ))}
          </div>

          {/* Reveal button */}
          {!showAnswers ? (
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
              <button className="btn btn-accent" onClick={() => setShowAnswers(true)}>
                Reveal Full Answers
              </button>
            </div>
          ) : (
            <div className="card animate-fade-in">
              <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-md)' }}>
                Answers — {selectedSize} Grid
              </h2>

              {/* Word list */}
              <div style={{ marginBottom: 'var(--space-lg)' }}>
                {currentPuzzle.words.map((w, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
                    padding: '8px 0',
                    borderBottom: i < currentPuzzle.words.length - 1 ? '1px solid var(--color-border)' : 'none',
                  }}>
                    <span style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: getWordColorHex(i), color: '#fff',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                    }}>
                      {i + 1}
                    </span>
                    <strong style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {w.word}
                    </strong>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                      ({w.length} letters)
                    </span>
                  </div>
                ))}
              </div>

              {/* Solution grid */}
              <h3 style={{ marginBottom: 'var(--space-sm)', fontSize: '1rem' }}>Solution Grid</h3>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-md)' }}>
                {renderSolutionGrid(currentPuzzle)}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          No puzzle available for this size today.
        </p>
      )}

      {/* SEO content */}
      <section style={{ maxWidth: '700px', margin: 'var(--space-3xl) auto 0' }}>
        <h2>About Today&apos;s Wend Answers</h2>
        <p style={{ marginTop: 'var(--space-md)' }}>
          Looking for today&apos;s Wend puzzle answers? This page provides daily hints and solutions
          for all six grid sizes (5x5 through 10x10). Each answer includes the word list and a
          color-coded solution grid showing exactly where each word traces through the board.
        </p>
        <p style={{ marginTop: 'var(--space-md)' }}>
          We update this page every day with fresh answers. If you prefer to solve the puzzle
          yourself, try our hints section first — it reveals only the first letter of each word
          without showing the full answer.
        </p>
      </section>
    </div>
  );
}
