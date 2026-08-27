#!/usr/bin/env bash
# One-time migration of the old SQLite data (docker volume) into Postgres.
#
# Run on the machine that has both the old volume and the infra stack:
#   ./scripts/migrate-sqlite-to-pg.sh
#
# Idempotent: rows that already exist in Postgres (same user id / same
# user+puzzle) are left untouched, so re-running is safe.
#
# Env overrides:
#   VOLUME        old sqlite docker volume   (default: wordbaazi_wordbaazi-data)
#   INFRA_COMPOSE infra compose file         (default: docker-compose-infra.yml)
#   DB_FILE       sqlite filename in volume  (default: wordbaazi.sqlite)
set -euo pipefail

VOLUME=${VOLUME:-wordbaazi_wordbaazi-data}
INFRA_COMPOSE=${INFRA_COMPOSE:-docker-compose-infra.yml}
DB_FILE=${DB_FILE:-wordbaazi.sqlite}
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# The DB is in WAL mode, which needs writable sidecar files even to read —
# so query a throwaway copy inside the container, never the volume itself.
sqlite_csv() {
  docker run --rm -v "$VOLUME":/data:ro alpine:3.20 \
    sh -c "apk add -q --no-cache sqlite && cp /data/$DB_FILE* /tmp/ && sqlite3 -csv /tmp/$DB_FILE \"$1\""
}

echo "Exporting from sqlite volume '$VOLUME' ($DB_FILE)..."
sqlite_csv "SELECT id,email,name,picture,created_at FROM users;" > "$TMP/users.csv"
sqlite_csv "SELECT user_id,puzzle_number,won,guesses,board_json,created_at FROM games;" > "$TMP/games.csv"
echo "  users: $(wc -l < "$TMP/users.csv" | tr -d ' ') rows, games: $(wc -l < "$TMP/games.csv" | tr -d ' ') rows"

echo "Importing into Postgres..."
{
  echo "BEGIN;"
  echo "CREATE TEMP TABLE su (id TEXT, email TEXT, name TEXT, picture TEXT, created_at TEXT);"
  echo "COPY su FROM STDIN WITH (FORMAT csv);"
  cat "$TMP/users.csv"
  echo "\\."
  echo "CREATE TEMP TABLE sg (user_id TEXT, puzzle_number INT, won INT, guesses INT, board_json TEXT, created_at TEXT);"
  echo "COPY sg FROM STDIN WITH (FORMAT csv);"
  cat "$TMP/games.csv"
  echo "\\."
  cat <<'SQL'
INSERT INTO users (id, email, name, picture, created_at)
SELECT id, email, name, picture, created_at::timestamptz
FROM su
ON CONFLICT (id) DO NOTHING;

INSERT INTO games (user_id, puzzle_number, won, guesses, board_json, created_at)
SELECT user_id, puzzle_number, won <> 0, guesses, board_json, created_at::timestamptz
FROM sg
ON CONFLICT (user_id, puzzle_number) DO NOTHING;

SELECT 'pg users total: ' || count(*) FROM users;
SELECT 'pg games total: ' || count(*) FROM games;
COMMIT;
SQL
} | docker compose -f "$INFRA_COMPOSE" exec -T postgres psql -U wordbaazi -d wordbaazi -v ON_ERROR_STOP=1

echo "Done."
