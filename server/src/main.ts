import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initDb } from './db';

async function bootstrap() {
  await initDb();
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({ origin: true });
  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  console.log(`Wordbaazi server listening on http://localhost:${port}/api`);
}
bootstrap();
