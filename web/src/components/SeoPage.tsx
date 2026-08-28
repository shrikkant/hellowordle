import Link from 'next/link';
import type { ReactNode } from 'react';

export default function SeoPage({ children }: { children: ReactNode }) {
  return (
    <main className="seo-page">
      <header className="header">
        <div className="header-left" />
        <Link href="/" className="header-title">
          Word<span className="brand-accent">baazi</span>
        </Link>
        <div className="header-right" />
      </header>
      <article className="seo">
        {children}
        <p>
          <Link href="/" className="cta-btn">
            Play today&rsquo;s puzzle
          </Link>
        </p>
        <nav className="seo-footer-nav" aria-label="More about Wordbaazi">
          <Link href="/guess-the-word-game">Guess the Word Game</Link>
          <Link href="/word-coach">Word Coach</Link>
          <Link href="/english-word-games">English Word Games</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
      </article>
    </main>
  );
}
