import { Pool } from 'pg';

export const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ?? 'postgres://wordbaazi:wordbaazi@localhost:5432/wordbaazi',
});

export async function initDb(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT,
      name TEXT,
      picture TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS games (
      user_id TEXT NOT NULL REFERENCES users(id),
      puzzle_number INTEGER NOT NULL,
      won BOOLEAN NOT NULL,
      guesses INTEGER,
      board_json TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (user_id, puzzle_number)
    );
    CREATE TABLE IF NOT EXISTS deletion_requests (
      id BIGSERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      note TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    -- One open request per address, so a repeated submit is a no-op rather
    -- than filling the table. Resolving a request frees the address again.
    CREATE UNIQUE INDEX IF NOT EXISTS deletion_requests_pending_email
      ON deletion_requests (email) WHERE status = 'pending';
  `);
}
