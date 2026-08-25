import { ANSWERS } from '../words/answers';
import { VALID } from '../words/valid';

export type TileState = 'correct' | 'present' | 'absent';
export type GameStatus = 'playing' | 'won' | 'lost';

const EPOCH = new Date(2026, 7, 25); // Wordbaazi launch: 2026-08-25 local time = puzzle #1

export function getPuzzleNumber(now: Date = new Date()): number {
  const start = new Date(EPOCH.getFullYear(), EPOCH.getMonth(), EPOCH.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((today.getTime() - start.getTime()) / 86400000) + 1;
}

export function getAnswer(puzzleNumber: number): string {
  const i = puzzleNumber - 1;
  return ANSWERS[((i % ANSWERS.length) + ANSWERS.length) % ANSWERS.length];
}

export function isValidWord(word: string): boolean {
  const w = word.toLowerCase();
  return VALID.has(w) || ANSWERS.includes(w);
}

// Greens consume answer letters first, then yellows left-to-right.
export function evaluateGuess(guess: string, answer: string): TileState[] {
  const g = guess.toLowerCase().split('');
  const a = answer.toLowerCase().split('');
  const result: TileState[] = new Array(5).fill('absent');
  const remaining: Record<string, number> = {};

  for (let i = 0; i < 5; i++) {
    if (g[i] === a[i]) {
      result[i] = 'correct';
    } else {
      remaining[a[i]] = (remaining[a[i]] ?? 0) + 1;
    }
  }
  for (let i = 0; i < 5; i++) {
    if (result[i] !== 'correct' && (remaining[g[i]] ?? 0) > 0) {
      result[i] = 'present';
      remaining[g[i]]--;
    }
  }
  return result;
}

// Best-known state per letter for keyboard coloring.
export function keyboardStates(guesses: string[], answer: string): Record<string, TileState> {
  const rank: Record<TileState, number> = { absent: 0, present: 1, correct: 2 };
  const states: Record<string, TileState> = {};
  for (const guess of guesses) {
    const evals = evaluateGuess(guess, answer);
    guess.toLowerCase().split('').forEach((ch, i) => {
      const prev = states[ch];
      if (!prev || rank[evals[i]] > rank[prev]) states[ch] = evals[i];
    });
  }
  return states;
}
