# Wordbaazi Server

NestJS API for Wordbaazi. Google Sign-In auth, game results and stats stored in SQLite (`data/wordbaazi.sqlite`, auto-created on first boot).

## Setup

```bash
cd server
npm install
cp .env.example .env   # then edit .env
npm run build
npm start              # or: npm run start:dev
```

Server listens on `http://localhost:3000/api` (port via `PORT`).

## Environment variables (`.env`)

| Var | Purpose |
|---|---|
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Web client ID used to verify Google ID tokens |
| `JWT_SECRET` | Secret for signing app JWTs (set a long random string) |
| `PORT` | HTTP port, default 3000 |

The server boots without `GOOGLE_CLIENT_ID`, but `/api/auth/google` will return a 500 with a clear message until it is set.

## Getting a Google client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → create/select a project.
2. **APIs & Services → OAuth consent screen**: configure (External, add your test users).
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**, application type **Web application**.
4. Add authorized JavaScript origin `http://localhost:5173` (the web app dev URL).
5. Copy the client ID into `server/.env` **and** the web app's `web/.env` (`VITE_GOOGLE_CLIENT_ID`).
6. For the Flutter app, additionally create Android/iOS client IDs in the same project (see `app/README.md`).

## API

All routes are prefixed `/api`. Authenticated routes take `Authorization: Bearer <app JWT>`.

- `POST /api/auth/google` — body `{ idToken }` (a Google ID token). Verifies it, upserts the user, returns `{ token, user: { id, name, email, picture } }`.
- `GET /api/me` — current user.
- `POST /api/games` — body `{ puzzleNumber, won, guesses (1–6 or null on loss), board: string[] }`. Idempotent per (user, puzzle): only the first result for a puzzle counts.
- `GET /api/stats` — `{ played, winPct, currentStreak, maxStreak, distribution: {1..6} }`. Streaks count consecutive won puzzle numbers; a loss or a skipped day breaks them.
