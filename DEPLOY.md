# Wordbaazi — Deployment

## Docker Compose (the app stack)

Two containers: **web** (nginx serving the built React app, proxying `/api` to the server — one origin, no CORS) and **server** (NestJS API). Game data lives in the `wordbaazi-data` named volume, so redeploys keep player stats.

```bash
cp .env.example .env          # then set JWT_SECRET (openssl rand -hex 32)
docker compose up -d --build
# → http://localhost:8080  (change WEB_PORT in .env)
```

`GOOGLE_CLIENT_ID` in `.env` is optional; it is used by the API to verify Google tokens and baked into the web bundle at build time (so rebuild after changing it). For a production domain, add that origin to the OAuth client in Google Cloud Console.

Useful commands:

```bash
docker compose ps                 # status + health
docker compose logs -f server     # API logs
docker compose down               # stop (data volume kept)
docker volume rm wordbaazi_wordbaazi-data   # wipe all stats (destructive)
```

## Jenkins

A ready-to-run Jenkins lives in `jenkins/` — Jenkins LTS plus the Docker CLI/Compose, talking to the host's Docker daemon through the socket mount. It deploys the app stack on the same machine.

### One-time setup

```bash
cd jenkins && docker compose up -d --build
# → http://localhost:8090
docker exec wordbaazi-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

1. Open http://localhost:8090, paste the initial admin password, choose **Install suggested plugins**, create your admin user.
2. **Manage Jenkins → Credentials → System → Global** — add two **Secret text** credentials:
   - `wordbaazi-jwt-secret` — output of `openssl rand -hex 32`
   - `wordbaazi-google-client-id` — your Google OAuth client ID (a placeholder like `unset` is fine until you have one)
3. **New Item → Pipeline** (name it `wordbaazi`):
   - *Pipeline → Definition*: **Pipeline script from SCM**, SCM **Git**, your repository URL, branch `main`, script path `Jenkinsfile`.
   - (The project must be pushed to a git remote Jenkins can reach — or use a local path as the repo URL.)
4. **Build Now**.

### What the pipeline does

| Stage | What happens |
|---|---|
| Test: server / web | Compile both projects inside their Dockerfile build stages |
| Build images | `docker compose build --pull` with secrets injected from Jenkins credentials |
| Deploy | `docker compose up -d --remove-orphans` on the host daemon |
| Smoke test | Hits `/api/health` and `/` through nginx from inside the compose network |

On failure it prints `docker compose ps` + recent logs. Old dangling images are pruned after every run.

### Notes

- The Jenkins container runs as root so it can use the mounted Docker socket without GID juggling — fine for a single-user box; don't expose port 8090 to the internet as-is.
- Jenkins deploys to the same Docker daemon it runs on. For deploying to a *remote* host, set `DOCKER_HOST=ssh://user@host` in the deploy stage (and add the SSH key as a Jenkins credential).
- The Flutter app is not part of this pipeline; mobile releases go through the app stores.
