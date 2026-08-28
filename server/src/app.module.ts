import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { DeletionController } from './deletion.controller';
import { GamesController } from './games.controller';
import { HealthController } from './health.controller';

@Module({
  controllers: [AuthController, DeletionController, GamesController, HealthController],
})
export class AppModule {}
