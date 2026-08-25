import { Controller, Get } from '@nestjs/common';
import { db } from './db';

@Controller('health')
export class HealthController {
  @Get()
  health() {
    db.prepare('SELECT 1').get();
    return { ok: true };
  }
}
