import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

const dataDir = process.env.DATA_DIR ?? path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(path.join(dataDir, 'wordbaazi.sqlite'));

db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT,
    name TEXT,
    picture TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS games (
    user_id TEXT NOT NULL REFERENCES users(id),
    puzzle_number INTEGER NOT NULL,
    won INTEGER NOT NULL,
    guesses INTEGER,
    board_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, puzzle_number)
  );
`);
