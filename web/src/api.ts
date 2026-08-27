import type { Stats, User } from './game/storage';
import { getToken } from './game/storage';

// Same-origin: Next.js rewrites proxy /api/* to the NestJS server.
const API_BASE = '';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json();
}

export function signInWithGoogle(idToken: string): Promise<{ token: string; user: User }> {
  return request('/api/auth/google', { method: 'POST', body: JSON.stringify({ idToken }) });
}

export function postGame(puzzleNumber: number, won: boolean, guesses: number | null, board: string[]): Promise<{ ok: boolean }> {
  return request('/api/games', { method: 'POST', body: JSON.stringify({ puzzleNumber, won, guesses, board }) });
}

export function fetchStats(): Promise<Stats> {
  return request('/api/stats');
}
