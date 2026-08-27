import type { Metadata, Viewport } from 'next';
import { GoogleTagManager } from '@next/third-parties/google';
import './globals.css';

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export const metadata: Metadata = {
  metadataBase: new URL('https://wordbaazi.com'),
  title: 'Wordbaazi — Free Guess the Word Game | Daily Word Puzzle',
  description:
    'Play Wordbaazi, a free guess the word game and daily word coach. Solve the 5-letter puzzle in 6 tries, sharpen your English vocabulary, and track your streaks.',
  icons: { icon: '/favicon.svg' },
  openGraph: {
    type: 'website',
    siteName: 'Wordbaazi',
    url: 'https://wordbaazi.com/',
  },
  twitter: { card: 'summary' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {GTM_ID && <GoogleTagManager gtmId={GTM_ID} />}
      <body>{children}</body>
    </html>
  );
}
