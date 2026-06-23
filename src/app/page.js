'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import WendBoard from '@/components/game/WendBoard';

const GRID_CONFIGS = [
  { size: '5x5', label: '5 x 5', words: 4, difficulty: 'Easy', badge: 'badge-easy' },
  { size: '6x6', label: '6 x 6', words: 5, difficulty: 'Moderate', badge: 'badge-moderate' },
  { size: '7x7', label: '7 x 7', words: 5, difficulty: 'Medium', badge: 'badge-moderate' },
  { size: '8x8', label: '8 x 8', words: 6, difficulty: 'Hard', badge: 'badge-hard' },
  { size: '9x9', label: '9 x 9', words: 6, difficulty: 'Expert', badge: 'badge-expert' },
  { size: '10x10', label: '10 x 10', words: 7, difficulty: 'Master', badge: 'badge-master' },
];

const FAQ_ITEMS = [
  {
    q: 'What is the Wend game?',
    a: 'Wend is a daily word puzzle originally from LinkedIn. You are given a grid of letters with gray wall blocks. You need to trace hidden words by connecting adjacent letters (up, down, left, right — no diagonals), bending around the walls, until every open tile is used exactly once.',
  },
  {
    q: 'How do I play Wend on WendPlay?',
    a: 'Pick a grid size from the daily challenge cards on our homepage (5x5 to 10x10). Click or drag across adjacent letter tiles to trace a word. When your traced path matches a hidden word, it locks in. Find all the words to complete the puzzle. Use Hint if stuck, Undo to remove the last word, or Reset to start over.',
  },
  {
    q: 'Is WendPlay free? Do I need an account?',
    a: 'Completely free, no sign-up needed. Just open the site and play. Your progress saves automatically in your browser.',
  },
  {
    q: 'How is Wend different from Wordle or word search?',
    a: 'In Wordle you guess one word in limited tries. In a word search, words go in straight lines. In Wend, words bend around walls, and every tile must be used exactly once — making it part word-hunt, part jigsaw puzzle. You need both vocabulary and spatial reasoning.',
  },
  {
    q: 'Can I play more than one puzzle a day?',
    a: 'Yes. Our daily challenge offers a different puzzle for each grid size (6 puzzles daily). Plus, the Practice section has 50+ curated puzzles, and Unlimited mode lets you play endlessly.',
  },
  {
    q: 'Is WendPlay affiliated with LinkedIn?',
    a: 'No. WendPlay is an independent fan site. We generate our own puzzles. All rights to the Wend game concept belong to LinkedIn. You can play the official version at linkedin.com/games/wend.',
  },
];

export default function HomePage() {
  const [todayStr, setTodayStr] = useState('');
  const [selectedPuzzle, setSelectedPuzzle] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    setTodayStr(dateStr);
  }, []);

  const handlePlaySize = async (size) => {
    if (!todayStr) return;
    try {
      const res = await fetch(`/api/puzzle/daily?date=${todayStr}&size=${size}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedPuzzle(data);
        setSelectedSize(size);
        // Scroll to game
        setTimeout(() => {
          document.getElementById('game-area')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (e) {
      console.error('Failed to load puzzle:', e);
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="hero container">
        <span className="hero-eyebrow">Daily word-path puzzle</span>
        <h1>Trace Hidden Words, Solve the Grid</h1>
        <p>
          Pick a grid size below. Drag across letters to trace words that bend around walls.
          Use every tile exactly once. A new set of puzzles every day.
        </p>
        <div className="hero-actions">
          <a href="#daily-challenge" className="btn btn-accent btn-lg">Today&apos;s Challenge</a>
          <Link href="/unlimited" className="btn btn-outline btn-lg">Unlimited Play</Link>
        </div>
      </section>

      {/* Daily Challenge Grid */}
      <section id="daily-challenge" className="section container">
        <div className="section-header">
          <h2>Daily Challenge</h2>
          <p>
            {todayStr ? new Date(todayStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'Loading...'}
            {' '} — Choose your grid size
          </p>
        </div>

        <div className="grid-size-cards">
          {GRID_CONFIGS.map(config => (
            <button
              key={config.size}
              className={`grid-size-card ${selectedSize === config.size ? 'card-interactive' : ''}`}
              onClick={() => handlePlaySize(config.size)}
              style={selectedSize === config.size ? { borderColor: 'var(--color-accent)' } : {}}
            >
              <div className="grid-label">{config.label}</div>
              <span className={`badge ${config.badge} grid-difficulty`}>{config.difficulty}</span>
              <div className="grid-word-count">{config.words} words</div>
            </button>
          ))}
        </div>
      </section>

      {/* Game Area */}
      {selectedPuzzle && (
        <section id="game-area" className="section container animate-fade-in">
          <WendBoard puzzle={selectedPuzzle} />
        </section>
      )}

      {/* Ad slot placeholder */}
      <div className="ad-slot container">
        {/* AdSense will be placed here when approved */}
      </div>

      {/* How to Play */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2>How to Play Wend</h2>
            <p>Simple to learn, satisfying to master.</p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-num">1</div>
              <h3>Start anywhere</h3>
              <p>Tap or click any letter tile to begin tracing a word.</p>
            </div>
            <div className="step-card">
              <div className="step-num">2</div>
              <h3>Trace neighbors</h3>
              <p>Drag to adjacent tiles — up, down, left, right. No diagonals allowed.</p>
            </div>
            <div className="step-card">
              <div className="step-num">3</div>
              <h3>Bend around walls</h3>
              <p>Gray blocks are walls. Words must wind around them.</p>
            </div>
            <div className="step-card">
              <div className="step-num">4</div>
              <h3>Use every tile</h3>
              <p>Each letter belongs to exactly one word. Fill the entire board to win.</p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)' }}>
            <Link href="/how-to-play" className="btn btn-outline">Full rules and strategy guide</Link>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="section container">
        <div className="section-header">
          <h2>More Ways to Play</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-md)' }}>
          <Link href="/archive" className="card card-interactive" style={{ textDecoration: 'none', color: 'var(--color-text)' }}>
            <h3>Puzzle Archive</h3>
            <p style={{ marginTop: '8px' }}>Browse and play every past daily puzzle. Never miss a day.</p>
          </Link>
          <Link href="/practice" className="card card-interactive" style={{ textDecoration: 'none', color: 'var(--color-text)' }}>
            <h3>Practice Puzzles</h3>
            <p style={{ marginTop: '8px' }}>50+ curated puzzles from easy to expert. Build your skills.</p>
          </Link>
          <Link href="/unlimited" className="card card-interactive" style={{ textDecoration: 'none', color: 'var(--color-text)' }}>
            <h3>Unlimited Mode</h3>
            <p style={{ marginTop: '8px' }}>Endless randomly-generated puzzles. Play all day, every day.</p>
          </Link>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <h2>WendPlay vs LinkedIn Wend</h2>
            <p>Same game mechanics, more ways to play.</p>
          </div>
          <div style={{ maxWidth: '600px', margin: '0 auto', overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th style={{ color: 'var(--color-accent)', fontWeight: 700 }}>WendPlay</th>
                  <th>LinkedIn Wend</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Login required</td><td><strong>No</strong></td><td>Yes</td></tr>
                <tr><td>Daily puzzles</td><td><strong>6 grid sizes</strong></td><td>1 per day</td></tr>
                <tr><td>Grid sizes</td><td><strong>5x5 to 10x10</strong></td><td>5x5 only</td></tr>
                <tr><td>Unlimited play</td><td><strong>Yes</strong></td><td>No</td></tr>
                <tr><td>Practice mode</td><td><strong>50+ puzzles</strong></td><td>No</td></tr>
                <tr><td>Archive</td><td><strong>Full history</strong></td><td>Limited</td></tr>
                <tr><td>Answers & hints</td><td><strong>Available</strong></td><td>Hints only</td></tr>
                <tr><td>Works on</td><td><strong>Any browser</strong></td><td>App + web</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section container">
        <div className="section-header">
          <h2>Frequently Asked Questions</h2>
        </div>
        <div className="faq-list">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className={`faq-item ${openFaq === i ? 'faq-item--open' : ''}`}>
              <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {item.q}
                <svg className="faq-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <div className="faq-answer">
                <p>{item.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SEO Content */}
      <section className="section section-alt">
        <div className="container" style={{ maxWidth: '700px' }}>
          <h2>About WendPlay — Free Wend Game Online</h2>
          <p style={{ marginTop: 'var(--space-md)' }}>
            <strong>WendPlay</strong> is the free online home for Wend, the word-path puzzle
            made famous by LinkedIn. Every board is a grid where you trace hidden words — each
            one winding around fixed wall blocks — using every open letter tile exactly once.
          </p>
          <p style={{ marginTop: 'var(--space-md)' }}>
            Unlike the official LinkedIn version, WendPlay offers six different grid sizes daily
            (from 5x5 easy puzzles to 10x10 master challenges), a full date-wise archive, 50+
            curated practice puzzles across multiple difficulty levels, and an unlimited mode for
            endless play. No login required — just open and play on any device.
          </p>
          <p style={{ marginTop: 'var(--space-md)' }}>
            Wend was created by Thomas Snyder, LinkedIn&apos;s Principal Puzzlemaster and a multiple-time
            world sudoku champion. The game launched on LinkedIn on June 9, 2026. WendPlay is an
            independent fan site and is not affiliated with LinkedIn or Microsoft.
          </p>
        </div>
      </section>

      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ_ITEMS.map(item => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          }),
        }}
      />
    </>
  );
}
