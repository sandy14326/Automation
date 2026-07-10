import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environmental variables from the project root .env file
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable Cross-Origin Resource Sharing (CORS) for frontend client connections
  app.enableCors();
  
  const port = 3000;
  await app.listen(port);
  console.log(`[Autopilot AI Backend] Service initialized on: http://localhost:${port}`);
}
bootstrap();
