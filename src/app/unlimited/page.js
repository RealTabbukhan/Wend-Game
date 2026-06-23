'use client';

import { useState, useEffect, useCallback } from 'react';
import WendBoard from '@/components/game/WendBoard';
import { formatTime, getStats } from '@/lib/game-engine';

const GRID_SIZES = ['5x5', '6x6', '7x7', '8x8', '9x9', '10x10'];
const DIFFICULTY_MAP = {
  '5x5': 'Easy', '6x6': 'Moderate', '7x7': 'Medium',
  '8x8': 'Hard', '9x9': 'Expert', '10x10': 'Master',
};

export default function UnlimitedPage() {
  const [selectedSize, setSelectedSize] = useState('5x5');
  const [puzzle, setPuzzle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ played: 0, avgTime: 0, bestTime: 0 });
  const [gamesPlayed, setGamesPlayed] = useState(0);

  const loadPuzzle = useCallback(async (size) => {
    setLoading(true);
    setPuzzle(null);
    try {
      const res = await fetch(`/api/puzzle/unlimited?size=${size}`);
      if (res.ok) {
        const data = await res.json();
        setPuzzle(data);
      }
    } catch (e) {
      console.error('Failed to load puzzle');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    setStats(getStats());
    loadPuzzle(selectedSize);
  }, []);

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    loadPuzzle(size);
  };

  const handleNewGame = () => {
    loadPuzzle(selectedSize);
    setGamesPlayed(g => g + 1);
  };

  const handleComplete = () => {
    setStats(getStats());
  };

  return (
    <div className="container section">
      <div className="section-header">
        <h1>Unlimited Play</h1>
        <p>Endless Wend puzzles. Pick a size, solve, and get another one.</p>
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 'var(--space-xl)',
        marginBottom: 'var(--space-2xl)', flexWrap: 'wrap',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--color-accent)' }}>
            {stats.played}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Played</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--color-accent)' }}>
            {stats.avgTime > 0 ? formatTime(stats.avgTime) : '—'}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Avg Time</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--color-accent)' }}>
            {stats.bestTime > 0 ? formatTime(stats.bestTime) : '—'}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Best Time</div>
        </div>
      </div>

      {/* Size selector */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
        {GRID_SIZES.map(size => (
          <button
            key={size}
            className={`filter-btn ${selectedSize === size ? 'filter-btn--active' : ''}`}
            onClick={() => handleSizeChange(size)}
          >
            {size} — {DIFFICULTY_MAP[size]}
          </button>
        ))}
      </div>

      {/* New Game button */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
        <button className="btn btn-accent" onClick={handleNewGame} disabled={loading}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          New Game
        </button>
      </div>

      {/* Game */}
      {loading && (
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading puzzle...</p>
      )}
      {puzzle && !loading && (
        <div className="animate-fade-in">
          <WendBoard puzzle={puzzle} onComplete={handleComplete} />
        </div>
      )}
    </div>
  );
}
