# Wordbaazi — Web

React + Vite + TypeScript client for Wordbaazi, a daily word-guessing game.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
```

The game is fully playable without any configuration — stats are kept in localStorage.

## Google Sign-In (optional, for server-side stats)

1. Copy `.env.example` to `.env`.
2. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create an **OAuth client ID** of type **Web application** with authorized JavaScript origin `http://localhost:5173`.
3. Put the client ID in `VITE_GOOGLE_CLIENT_ID` (use the same ID for the server's `GOOGLE_CLIENT_ID`).
4. Start the server (`../server`) and sign in via the account icon (top right).

When signed in, finished games are posted to the API and the stats panel shows server-side stats; signed out, it falls back to local stats.

## Build

```bash
npm run build      # outputs dist/ — deploy anywhere static
```

Set `VITE_API_BASE` to your deployed API URL for production builds.
