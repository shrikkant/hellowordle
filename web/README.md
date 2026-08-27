# Wordbaazi — Web

Next.js (App Router) client for Wordbaazi. The game page and the SEO landing pages
(`/guess-the-word-game`, `/word-coach`, `/english-word-games`) are prerendered
server-side for SEO; the game board hydrates as a client component.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
```

`/api/*` is proxied by Next rewrites to the NestJS server (`INTERNAL_API_URL`,
default `http://localhost:3000`), so run `../server` alongside for sign-in/stats.
The game itself is fully playable without it.

## Env (build-time, baked into the client bundle)

Copy `.env.example` to `.env`:

- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — Google OAuth Web client ID (origin `http://localhost:5173` for dev)
- `NEXT_PUBLIC_GTM_ID` — Google Tag Manager container (leave empty in dev)

## Production

`npm run build` produces a standalone server (`output: 'standalone'`); the
Dockerfile runs it on port 3000. In Docker Compose, `INTERNAL_API_URL` points at
the API container and the GTM/Google IDs arrive as build args from the Jenkinsfile.
