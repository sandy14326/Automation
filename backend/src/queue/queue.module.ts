import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { LinkedinModule } from '../linkedin/linkedin.module';

@Module({
  imports: [LinkedinModule],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
