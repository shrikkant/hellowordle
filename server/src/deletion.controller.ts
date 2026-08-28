import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { pool } from './db';

// Deliberately unauthenticated: Google Play requires the deletion route to be
// reachable from the web by someone who can no longer sign in. Submitting only
// records the request — an operator fulfils it and marks the row resolved.
@Controller()
export class DeletionController {
  @Post('deletion-requests')
  async requestDeletion(@Body() body: { email?: unknown; note?: unknown }) {
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const note = typeof body?.note === 'string' ? body.note.trim() : '';

    // Deliberately loose: the address is a lookup key for a human, not a login.
    if (email.length < 3 || email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException('A valid email address is required');
    }
    if (note.length > 2000) {
      throw new BadRequestException('Note must be 2000 characters or fewer');
    }

    await pool.query(
      `INSERT INTO deletion_requests (email, note) VALUES ($1, $2)
       ON CONFLICT (email) WHERE status = 'pending' DO NOTHING`,
      [email, note || null],
    );
    // Always the same answer, so this cannot be used to probe who has an account.
    return { ok: true };
  }
}
