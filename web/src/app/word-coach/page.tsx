import type { Metadata } from 'next';
import Link from 'next/link';
import SeoPage from '../../components/SeoPage';

export const metadata: Metadata = {
  title: 'Word Coach Game — Daily Vocabulary Trainer | Wordbaazi',
  description:
    'Use Wordbaazi as your word coach: one 5-letter puzzle a day that trains spelling, letter patterns, and English vocabulary — with streaks and stats to keep you going.',
  alternates: { canonical: 'https://wordbaazi.com/word-coach' },
};

export default function Page() {
  return (
    <SeoPage>
      <h1>A Word Coach Game That Trains Your Vocabulary Daily</h1>
      <p>
        A good coach gives you one focused exercise, honest feedback, and a reason to come back tomorrow. That is exactly
        how Wordbaazi works as a word coach game: one five-letter puzzle a day, instant feedback on every guess, and
        streaks that reward showing up. Five minutes with your morning chai, and your English gets a little sharper every
        single day.
      </p>

      <h2>What the Daily Puzzle Actually Trains</h2>
      <p>
        Each round quietly drills the skills that make people good with words. You learn English letter patterns — which
        pairs start words, which endings are common, where vowels like to sit. You practise recall, digging out words you
        recognise but rarely use. And you build deduction habits: forming a hypothesis, testing it, and updating from the
        colour clues. Teal means right letter, right place; gold means right letter, wrong place; dark means not in the
        word. It is spaced repetition disguised as play.
      </p>

      <h2>Your Coach&rsquo;s Scoreboard</h2>
      <p>
        Progress you can see is progress that sticks. Wordbaazi tracks how many puzzles you have played, your win
        percentage, your current daily streak, and your best-ever streak — plus a guess distribution showing how often you
        solve the word in two, three, or four tries. Watch that distribution shift toward fewer guesses over a month:
        that is your vocabulary and pattern-recognition visibly improving. Sign in with Google and the scoreboard follows
        you across devices.
      </p>

      <h2>Coaching Tips to Improve Faster</h2>
      <p>
        Start with vowel-rich openers to map the word quickly. Say candidate words out loud — pronunciation often surfaces
        options your eyes miss. When you are stuck, write down the confirmed letters and deliberately list words that fit;
        that little struggle is where the learning happens. And when you miss a day, use the <Link href="/">archive</Link>{' '}
        to keep practising — every past puzzle remains playable.
      </p>

      <h2>Who Is It For?</h2>
      <p>
        Students preparing for exams get daily spelling and vocabulary reps. Professionals keep their English quick and
        precise. Families turn it into a friendly competition over who needs the fewest guesses. If you have been looking
        for a <Link href="/guess-the-word-game">guess the word game</Link> that doubles as genuine practice, this is it —
        free, and a new session starts every midnight.
      </p>
    </SeoPage>
  );
}
