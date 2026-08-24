import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.getHttpAdapter().getInstance().use(require('body-parser').json({ limit: '15mb' }));
  app.setGlobalPrefix('api/v1');
  const localOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'];
  const productionOrigins = (process.env.CORS_ORIGINS ?? 'https://primecapital.uz,https://www.primecapital.uz,https://web.primecapital.uz,https://ser.primecapital.uz')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({ origin: [...localOrigins, ...productionOrigins], credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.PORT ?? 4000);
}

void bootstrap();
