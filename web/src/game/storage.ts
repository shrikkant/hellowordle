import type { GameStatus } from './logic';

export interface SavedGame {
  puzzleNumber: number;
  guesses: string[];
  status: GameStatus;
}

export interface Stats {
  played: number;
  winPct: number;
  currentStreak: number;
  maxStreak: number;
  distribution: Record<number, number>;
}

export interface PuzzleResult {
  won: boolean;
  guesses: number | null;
}

const GAME_PREFIX = 'wb-game-';
const RESULTS_KEY = 'wb-results';
const TOKEN_KEY = 'hw-token';
const USER_KEY = 'hw-user';

export function loadGame(puzzleNumber: number): SavedGame | null {
  try {
    const raw = localStorage.getItem(GAME_PREFIX + puzzleNumber);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveGame(game: SavedGame): void {
  localStorage.setItem(GAME_PREFIX + game.puzzleNumber, JSON.stringify(game));
}

export function getResults(): Record<number, PuzzleResult> {
  try {
    const raw = localStorage.getItem(RESULTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function recordResult(puzzleNumber: number, won: boolean, guesses: number | null): void {
  const results = getResults();
  if (results[puzzleNumber]) return;
  results[puzzleNumber] = { won, guesses };
  localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
}

// Streaks run over consecutive puzzle numbers; the current streak is the run of
// wins ending at the most recent puzzle played (archive fills extend it).
export function getLocalStats(): Stats {
  const results = getResults();
  const numbers = Object.keys(results).map(Number).sort((a, b) => a - b);
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  let wins = 0;
  let maxStreak = 0;
  let run = 0;
  let prev: number | null = null;
  for (const n of numbers) {
    const r = results[n];
    if (r.won) {
      wins++;
      if (r.guesses != null) distribution[r.guesses] = (distribution[r.guesses] ?? 0) + 1;
      run = prev === n - 1 && run > 0 ? run + 1 : 1;
    } else {
      run = 0;
    }
    maxStreak = Math.max(maxStreak, run);
    prev = n;
  }
  return {
    played: numbers.length,
    winPct: numbers.length ? Math.round((wins / numbers.length) * 100) : 0,
    currentStreak: run,
    maxStreak,
    distribution,
  };
}

export interface User { id: string; name: string; email: string; picture: string }

export function getToken(): string | null { return localStorage.getItem(TOKEN_KEY); }
export function getUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
export function saveSession(token: string, user: User): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
