import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { GamesController } from './games.controller';
import { HealthController } from './health.controller';

@Module({
  controllers: [AuthController, GamesController, HealthController],
})
export class AppModule {}
