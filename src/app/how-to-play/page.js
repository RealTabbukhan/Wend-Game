import Link from 'next/link';

export const metadata = {
  title: 'How to Play Wend — Rules, Tips & Strategy Guide',
  description: 'Learn the rules of the Wend word puzzle game. Complete guide with step-by-step instructions, strategy tips, and scoring explained.',
};

export default function HowToPlayPage() {
  return (
    <div className="container section">
      <div className="section-header">
        <h1>How to Play Wend</h1>
        <p>
          Everything you need to know about solving Wend puzzles.
        </p>
      </div>

      {/* Quick Overview */}
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div className="card" style={{ marginBottom: 'var(--space-2xl)' }}>
          <h2>Quick Overview</h2>
          <p style={{ marginTop: 'var(--space-sm)' }}>
            Wend is a word-path puzzle. You see a grid of letters with some gray wall blocks.
            Hidden inside the grid are several words that wind through the letters. Your job is
            to find and trace all the words so that every open tile is used exactly once.
          </p>
        </div>

        {/* Step by step */}
        <h2 style={{ marginBottom: 'var(--space-lg)' }}>Step-by-Step Guide</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
          <div className="card">
            <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
              <div className="step-num">1</div>
              <div>
                <h3>Examine the Grid</h3>
                <p style={{ marginTop: '4px' }}>
                  The board shows a square grid of letter tiles. Gray cells are walls — they
                  are fixed and cannot be used. Below the grid you will see a list showing how
                  many letters each hidden word has (for example, &quot;3 ltr&quot;, &quot;5 ltr&quot;).
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
              <div className="step-num">2</div>
              <div>
                <h3>Trace a Word</h3>
                <p style={{ marginTop: '4px' }}>
                  Click or tap a letter tile to start. Then drag (or tap) to adjacent tiles —
                  up, down, left, or right. Diagonal connections are not allowed. As you drag,
                  the tiles highlight in a path color. Release to submit your trace.
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
              <div className="step-num">3</div>
              <div>
                <h3>Check Your Path</h3>
                <p style={{ marginTop: '4px' }}>
                  If the path you traced matches a hidden word, the tiles lock in with a color
                  and the word appears in the list below. If it does not match, the path
                  disappears and you can try again.
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
              <div className="step-num">4</div>
              <div>
                <h3>Use Every Tile</h3>
                <p style={{ marginTop: '4px' }}>
                  Each letter tile belongs to exactly one word. You cannot skip tiles and you
                  cannot share tiles between words. A correct solution uses every open tile.
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
              <div className="step-num">5</div>
              <div>
                <h3>Win!</h3>
                <p style={{ marginTop: '4px' }}>
                  Find all the words and the puzzle is complete. Your time and hints used are
                  recorded. Try to beat your best time!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Tips */}
        <h2 style={{ marginBottom: 'var(--space-lg)' }}>Strategy Tips</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginBottom: 'var(--space-2xl)' }}>
          <div className="card">
            <h3>Start at corners and edges</h3>
            <p style={{ marginTop: '4px' }}>
              Tiles in corners or pressed against walls have fewer possible neighbors.
              This makes them easier starting points — the word must go in one of very few
              directions.
            </p>
          </div>

          <div className="card">
            <h3>Count the letter clue</h3>
            <p style={{ marginTop: '4px' }}>
              The word list tells you how many letters each word has. Use this to plan ahead.
              If you see a 3-letter word and a corner cluster of 3 tiles, chances are good
              that is where the short word lives.
            </p>
          </div>

          <div className="card">
            <h3>Look for common letter pairs</h3>
            <p style={{ marginTop: '4px' }}>
              Pairs like TH, SH, CH, ST, and ING are strong anchors. If you see T next to H,
              that is likely the start or middle of a word.
            </p>
          </div>

          <div className="card">
            <h3>Think about the whole board</h3>
            <p style={{ marginTop: '4px' }}>
              A word is only correct if it leaves the remaining tiles able to form the other
              words. If you find a word but it isolates a cluster of tiles that cannot spell
              anything, undo it and try a different path.
            </p>
          </div>

          <div className="card">
            <h3>Use the Hint button wisely</h3>
            <p style={{ marginTop: '4px' }}>
              If you are truly stuck, the Hint button reveals the first letter of a random
              unsolved word, highlighting the cell. This narrows down where that word starts.
            </p>
          </div>
        </div>

        {/* Controls */}
        <h2 style={{ marginBottom: 'var(--space-lg)' }}>Controls</h2>

        <div className="card" style={{ marginBottom: 'var(--space-2xl)' }}>
          <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
            <div>
              <strong>Hint</strong> — Reveals the first letter of a random unsolved word by highlighting its cell.
            </div>
            <div>
              <strong>Undo</strong> — Removes the last word you found, freeing those tiles.
            </div>
            <div>
              <strong>Reset</strong> — Clears all progress and restarts the timer.
            </div>
            <div>
              <strong>Timer</strong> — Tracks how long you have been solving. Pauses if you leave the page.
            </div>
          </div>
        </div>

        {/* Grid sizes */}
        <h2 style={{ marginBottom: 'var(--space-lg)' }}>Grid Sizes</h2>

        <div style={{ overflow: 'hidden', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-2xl)' }}>
          <table className="comparison-table">
            <thead>
              <tr><th>Grid</th><th>Words</th><th>Letters Used</th><th>Difficulty</th></tr>
            </thead>
            <tbody>
              <tr><td>5 x 5</td><td>4</td><td>18</td><td>Easy</td></tr>
              <tr><td>6 x 6</td><td>5</td><td>25</td><td>Moderate</td></tr>
              <tr><td>7 x 7</td><td>5</td><td>30</td><td>Medium</td></tr>
              <tr><td>8 x 8</td><td>6</td><td>38</td><td>Hard</td></tr>
              <tr><td>9 x 9</td><td>6</td><td>39</td><td>Expert</td></tr>
              <tr><td>10 x 10</td><td>7</td><td>42</td><td>Master</td></tr>
            </tbody>
          </table>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: 'var(--space-md)' }}>Ready to play?</h2>
          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" className="btn btn-accent btn-lg">Today&apos;s Daily</Link>
            <Link href="/practice" className="btn btn-outline btn-lg">Practice Puzzles</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
