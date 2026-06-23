'use client';

import { useState, useEffect } from 'react';
import WendBoard from '@/components/game/WendBoard';

const DIFFICULTIES = [
  { key: 'all', label: 'All' },
  { key: 'easy', label: 'Easy' },
  { key: 'moderate', label: 'Moderate' },
  { key: 'hard', label: 'Hard' },
  { key: 'expert', label: 'Expert' },
];

export default function PracticePage() {
  const [allPuzzles, setAllPuzzles] = useState({});
  const [filter, setFilter] = useState('all');
  const [selectedPuzzle, setSelectedPuzzle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/puzzle/practice');
        if (res.ok) {
          const data = await res.json();
          setAllPuzzles(data);
        }
      } catch (e) {
        console.error('Failed to load practice puzzles');
      }
      setLoading(false);
    }
    load();
  }, []);

  const getFilteredPuzzles = () => {
    if (filter === 'all') {
      const all = [];
      for (const diff of ['easy', 'moderate', 'hard', 'expert']) {
        if (allPuzzles[diff]) {
          allPuzzles[diff].forEach(p => all.push({ ...p, difficultyLabel: diff }));
        }
      }
      return all;
    }
    return (allPuzzles[filter] || []).map(p => ({ ...p, difficultyLabel: filter }));
  };

  const puzzles = getFilteredPuzzles();

  const getBadgeClass = (diff) => {
    const map = { easy: 'badge-easy', moderate: 'badge-moderate', hard: 'badge-hard', expert: 'badge-expert' };
    return map[diff] || 'badge-easy';
  };

  if (selectedPuzzle) {
    return (
      <div className="container section">
        <button
          className="btn btn-ghost"
          onClick={() => setSelectedPuzzle(null)}
          style={{ marginBottom: 'var(--space-md)' }}
        >
          &larr; Back to Practice
        </button>
        <WendBoard puzzle={selectedPuzzle} />
      </div>
    );
  }

  return (
    <div className="container section">
      <div className="section-header">
        <h1>Practice Puzzles</h1>
        <p>50+ curated puzzles across all difficulty levels. Track your progress.</p>
      </div>

      <div className="practice-filters">
        {DIFFICULTIES.map(d => (
          <button
            key={d.key}
            className={`filter-btn ${filter === d.key ? 'filter-btn--active' : ''}`}
            onClick={() => setFilter(d.key)}
          >
            {d.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading puzzles...</p>
      ) : (
        <div className="practice-grid">
          {puzzles.map((puzzle, i) => (
            <button
              key={puzzle.id || i}
              className="card card-interactive"
              onClick={() => setSelectedPuzzle(puzzle)}
              style={{ textAlign: 'left', cursor: 'pointer', border: '1px solid var(--color-border)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
                  {puzzle.gridSize}
                </span>
                <span className={`badge ${getBadgeClass(puzzle.difficultyLabel)}`}>
                  {puzzle.difficultyLabel}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                {puzzle.words.length} words &middot; {puzzle.words.map(w => w.length).join(', ')} letters
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
