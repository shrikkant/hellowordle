import type { Metadata } from 'next';
import Link from 'next/link';
import SeoPage from '../../components/SeoPage';

export const metadata: Metadata = {
  title: 'Guess the Word Game — Play Free Online | Wordbaazi',
  description:
    'Wordbaazi is a free guess the word game: crack the hidden 5-letter English word in 6 tries using colour clues. New puzzle daily, playable in any browser.',
  alternates: { canonical: 'https://wordbaazi.com/guess-the-word-game' },
};

export default function Page() {
  return (
    <SeoPage>
      <h1>Guess the Word Game: Crack the Hidden Word in Six Tries</h1>
      <p>
        A guess the word game gives you a hidden word and a limited number of chances to find it — and Wordbaazi is the
        purest form of it. Every day there is one secret five-letter English word, the same for every player in the world.
        You get six guesses. There are no hints to buy, no timers, and nothing to install: open{' '}
        <Link href="/">wordbaazi.com</Link> in any browser and start guessing.
      </p>

      <h2>How the Guessing Works</h2>
      <p>
        Type any valid five-letter word and press enter — that is your first probe. The game then colours each letter of
        your guess. A teal tile means the letter is in the word and in exactly the right position. A gold tile means the
        letter is somewhere in the word, but not where you placed it. A dark tile means the letter is not in the word at
        all. Each guess shrinks the possibilities, and the on-screen keyboard remembers everything you have learned, so you
        always know which letters are still in play.
      </p>

      <h2>Strategy: How to Guess the Word in Fewer Tries</h2>
      <p>
        Strong openers use common letters — words like ARISE, AUDIO, or STONE test several frequent vowels and consonants
        at once. From there, play detective: if a letter turns gold, try it in a different slot; if a position turns teal,
        lock it in and vary the rest. Watch out for words with repeated letters — they are legal and they trip up even
        seasoned players. Most regulars solve the daily word in three or four guesses; getting it in two feels like magic,
        and getting it in one is pure legend.
      </p>

      <h2>One Word a Day Keeps It Fun</h2>
      <p>
        Because there is only one puzzle per day, the game stays a treat instead of a time-sink — a five-minute mental
        warm-up with your morning chai. Solve it and your streak grows; miss it and the word waits in the{' '}
        <Link href="/">archive</Link>, where every past puzzle stays playable. Sign in with Google and your wins, streaks,
        and guess distribution follow you across your phone and laptop.
      </p>

      <h2>Why Players Prefer Wordbaazi</h2>
      <p>
        Wordbaazi keeps the classic guess-the-word formula and strips away the clutter: it is free, fast, mobile-friendly,
        and honest — the answers come from a curated list of two thousand common English words, so you will never lose to
        obscure dictionary trivia. If you enjoy it, it also works beautifully as a <Link href="/word-coach">daily word
        coach</Link> for building vocabulary.
      </p>
    </SeoPage>
  );
}
