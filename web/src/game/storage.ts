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

interface LocalStatsRaw {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  lastWonPuzzle: number | null;
  lastPlayedPuzzle: number | null;
  distribution: Record<number, number>;
}

const GAME_KEY = 'hw-game';
const STATS_KEY = 'hw-stats';
const TOKEN_KEY = 'hw-token';
const USER_KEY = 'hw-user';

export function loadGame(puzzleNumber: number): SavedGame | null {
  try {
    const raw = localStorage.getItem(GAME_KEY);
    if (!raw) return null;
    const game: SavedGame = JSON.parse(raw);
    return game.puzzleNumber === puzzleNumber ? game : null;
  } catch {
    return null;
  }
}

export function saveGame(game: SavedGame): void {
  localStorage.setItem(GAME_KEY, JSON.stringify(game));
}

function emptyStats(): LocalStatsRaw {
  return {
    played: 0, wins: 0, currentStreak: 0, maxStreak: 0,
    lastWonPuzzle: null, lastPlayedPuzzle: null,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
  };
}

function loadRawStats(): LocalStatsRaw {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? { ...emptyStats(), ...JSON.parse(raw) } : emptyStats();
  } catch {
    return emptyStats();
  }
}

export function recordResult(puzzleNumber: number, won: boolean, guesses: number | null): void {
  const s = loadRawStats();
  if (s.lastPlayedPuzzle === puzzleNumber) return;
  s.played++;
  s.lastPlayedPuzzle = puzzleNumber;
  if (won && guesses != null) {
    s.wins++;
    s.distribution[guesses] = (s.distribution[guesses] ?? 0) + 1;
    s.currentStreak = s.lastWonPuzzle === puzzleNumber - 1 ? s.currentStreak + 1 : 1;
    s.maxStreak = Math.max(s.maxStreak, s.currentStreak);
    s.lastWonPuzzle = puzzleNumber;
  } else {
    s.currentStreak = 0;
  }
  localStorage.setItem(STATS_KEY, JSON.stringify(s));
}

export function getLocalStats(): Stats {
  const s = loadRawStats();
  return {
    played: s.played,
    winPct: s.played ? Math.round((s.wins / s.played) * 100) : 0,
    currentStreak: s.currentStreak,
    maxStreak: s.maxStreak,
    distribution: s.distribution,
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
