'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import WendBoard from '@/components/game/WendBoard';

const GRID_CONFIGS = [
  { size: '5x5', label: '5 x 5', difficulty: 'Easy', badge: 'badge-easy' },
  { size: '6x6', label: '6 x 6', difficulty: 'Moderate', badge: 'badge-moderate' },
  { size: '7x7', label: '7 x 7', difficulty: 'Medium', badge: 'badge-moderate' },
  { size: '8x8', label: '8 x 8', difficulty: 'Hard', badge: 'badge-hard' },
  { size: '9x9', label: '9 x 9', difficulty: 'Expert', badge: 'badge-expert' },
  { size: '10x10', label: '10 x 10', difficulty: 'Master', badge: 'badge-master' },
];

export default function DailyDatePage({ params }) {
  const [puzzles, setPuzzles] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedPuzzle, setSelectedPuzzle] = useState(null);
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    async function unwrapParams() {
      const p = await params;
      setDateStr(p.date);
    }
    unwrapParams();
  }, [params]);

  const handleSelectSize = async (size) => {
    if (!dateStr) return;
    try {
      const res = await fetch(`/api/puzzle/daily?date=${dateStr}&size=${size}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedPuzzle(data);
        setSelectedSize(size);
      }
    } catch (e) {
      console.error('Failed to load puzzle');
    }
  };

  const formattedDate = dateStr
    ? new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div className="container section">
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <Link href="/archive" style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          &larr; Back to Archive
        </Link>
      </div>

      <div className="section-header">
        <h1>Daily Puzzle — {formattedDate}</h1>
        <p>Choose a grid size to play</p>
      </div>

      <div className="grid-size-cards" style={{ maxWidth: '700px', margin: '0 auto var(--space-2xl)' }}>
        {GRID_CONFIGS.map(config => (
          <button
            key={config.size}
            className="grid-size-card"
            onClick={() => handleSelectSize(config.size)}
            style={selectedSize === config.size ? { borderColor: 'var(--color-accent)' } : {}}
          >
            <div className="grid-label">{config.label}</div>
            <span className={`badge ${config.badge}`}>{config.difficulty}</span>
          </button>
        ))}
      </div>

      {selectedPuzzle && (
        <div className="animate-fade-in">
          <WendBoard puzzle={selectedPuzzle} />
        </div>
      )}
    </div>
  );
}
