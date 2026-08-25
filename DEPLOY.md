# Wordbaazi — Deployment

## Docker Compose (the app stack)

Two containers: **web** (nginx serving the built React app, proxying `/api` to the server — one origin, no CORS) and **server** (NestJS API). Game data lives in the `wordbaazi-data` named volume, so redeploys keep player stats.

```bash
cp .env.example .env          # then set JWT_SECRET (openssl rand -hex 32)
docker compose up -d --build
# → http://localhost:7654  (change WEB_PORT in .env)
```

`GOOGLE_CLIENT_ID` in `.env` is optional; it is used by the API to verify Google tokens and baked into the web bundle at build time (so rebuild after changing it). For a production domain, add that origin to the OAuth client in Google Cloud Console.

Useful commands:

```bash
docker compose ps                 # status + health
docker compose logs -f server     # API logs
docker compose down               # stop (data volume kept)
docker volume rm wordbaazi_wordbaazi-data   # wipe all stats (destructive)
```

## Jenkins (your existing instance)

The `Jenkinsfile` at the repo root deploys the compose stack. Requirements on the Jenkins agent that runs it: **Docker CLI + Compose v2** with access to the Docker daemon of the machine you're deploying to (local socket, or `DOCKER_HOST=ssh://user@host` for a remote box).

### One-time setup

1. Credentials: the pipeline signs session JWTs with the **Secret text** credential `shri-git-token` (already present in this Jenkins). To enable Google sign-in later, set `GOOGLE_CLIENT_ID` in the Jenkinsfile `environment` block to your OAuth Web client ID and re-run.
2. **New Item → Pipeline** (name it `wordbaazi`):
   - *Pipeline → Definition*: **Pipeline script from SCM**, SCM **Git**, your repository URL, branch `main`, script path `Jenkinsfile`.
   - (The project must be pushed to a git remote Jenkins can reach.)
3. **Build Now**.

### What the pipeline does

| Stage | What happens |
|---|---|
| Test: server / web | Compile both projects inside their Dockerfile build stages |
| Build images | `docker compose build --pull` with secrets injected from Jenkins credentials |
| Deploy | `docker compose up -d --remove-orphans` on the host daemon |
| Smoke test | Hits `/api/health` and `/` through nginx from inside the compose network |

On failure it prints `docker compose ps` + recent logs. Old dangling images are pruned after every run.

### Notes

- The pipeline uses only Docker build contexts (no `-v` volume mounts), so it also works when Jenkins itself runs in a container against the host's Docker socket.
- The stack is deployed on whatever daemon the agent's Docker CLI points at; the app comes up on port 7654 of that machine (`WEB_PORT` env in the Jenkinsfile).
- The Flutter app is not part of this pipeline; mobile releases go through the app stores.
