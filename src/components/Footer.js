import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-links">
          <Link href="/">Daily Challenge</Link>
          <Link href="/archive">Archive</Link>
          <Link href="/practice">Practice</Link>
          <Link href="/unlimited">Unlimited</Link>
          <Link href="/how-to-play">How to Play</Link>
          <Link href="/answers">Today&apos;s Answers</Link>
          <Link href="https://www.linkedin.com/games/wend" target="_blank" rel="noopener noreferrer">
            Official LinkedIn Wend
          </Link>
        </div>
        <p className="footer-disclaimer">
          WendPlay.com is a fan-made tribute and practice site. It is <strong>not affiliated with,
          authorized, or endorsed by LinkedIn</strong> or Microsoft. All rights to the Wend game
          concept and brand belong to LinkedIn. The original game can be played at{' '}
          <a href="https://www.linkedin.com/games/wend" target="_blank" rel="noopener noreferrer">
            linkedin.com/games/wend
          </a>.
        </p>
        <p className="footer-disclaimer" style={{ marginTop: '8px' }}>
          &copy; {new Date().getFullYear()} WendPlay.com. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
