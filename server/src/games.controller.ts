import { BadRequestException, Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { db } from './db';
import { AuthGuard } from './auth.guard';

interface GameRow {
  puzzle_number: number;
  won: number;
  guesses: number | null;
}

@Controller()
@UseGuards(AuthGuard)
export class GamesController {
  @Post('games')
  saveGame(
    @Req() req: { userId: string },
    @Body() body: { puzzleNumber?: unknown; won?: unknown; guesses?: unknown; board?: unknown },
  ) {
    if (
      !body ||
      typeof body.puzzleNumber !== 'number' ||
      !Number.isInteger(body.puzzleNumber) ||
      body.puzzleNumber < 0 ||
      typeof body.won !== 'boolean' ||
      !(body.guesses === null || (Number.isInteger(body.guesses) && (body.guesses as number) >= 1 && (body.guesses as number) <= 6)) ||
      !Array.isArray(body.board) ||
      !body.board.every((w) => typeof w === 'string')
    ) {
      throw new BadRequestException('Expected { puzzleNumber: int, won: boolean, guesses: 1-6|null, board: string[] }');
    }
    if (body.won && body.guesses === null) {
      throw new BadRequestException('guesses is required when won is true');
    }
    // Idempotent: first write per (user, puzzle) wins; repeats are ignored.
    db.prepare(
      `INSERT OR IGNORE INTO games (user_id, puzzle_number, won, guesses, board_json)
       VALUES (?, ?, ?, ?, ?)`,
    ).run(req.userId, body.puzzleNumber, body.won ? 1 : 0, body.guesses, JSON.stringify(body.board));
    return { ok: true };
  }

  @Get('stats')
  stats(@Req() req: { userId: string }) {
    const rows = db
      .prepare(
        'SELECT puzzle_number, won, guesses FROM games WHERE user_id = ? ORDER BY puzzle_number ASC',
      )
      .all(req.userId) as GameRow[];

    const played = rows.length;
    const wins = rows.filter((r) => r.won).length;
    const winPct = played === 0 ? 0 : Math.round((wins / played) * 100);

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    for (const r of rows) {
      if (r.won && r.guesses !== null && r.guesses >= 1 && r.guesses <= 6) {
        distribution[r.guesses]++;
      }
    }

    // Streaks: consecutive won puzzleNumbers; a gap in puzzle numbers or a loss breaks the run.
    let maxStreak = 0;
    let run = 0;
    let prevPuzzle: number | null = null;
    for (const r of rows) {
      if (r.won) {
        run = prevPuzzle !== null && r.puzzle_number === prevPuzzle + 1 && run > 0 ? run + 1 : 1;
      } else {
        run = 0;
      }
      maxStreak = Math.max(maxStreak, run);
      prevPuzzle = r.puzzle_number;
    }
    // Current streak: the run ending at the most recently played puzzle.
    const currentStreak = run;

    return { played, winPct, currentStreak, maxStreak, distribution };
  }
}
