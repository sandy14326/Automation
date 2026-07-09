import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { LinkedinModule } from './linkedin/linkedin.module';
import { QueueModule } from './queue/queue.module';
import { AiModule } from './ai/ai.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [
    AuthModule,
    LinkedinModule,
    QueueModule,
    AiModule,
    WhatsappModule,
  ],
})
export class AppModule {}
