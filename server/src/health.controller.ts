import { Controller, Get } from '@nestjs/common';
import { pool } from './db';

@Controller('health')
export class HealthController {
  @Get()
  async health() {
    await pool.query('SELECT 1');
    return { ok: true };
  }
}
