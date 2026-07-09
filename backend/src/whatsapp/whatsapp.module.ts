import { Module } from '@nestjs/common';
import { QueueService } from '../queue/queue.service';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { LinkedinModule } from '../linkedin/linkedin.module';

@Module({
  imports: [LinkedinModule],
  controllers: [WhatsappController],
  providers: [WhatsappService, QueueService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
