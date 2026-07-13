import { Module } from '@nestjs/common';
import { LinkedinService } from './linkedin.service';
import { LinkedinController } from './linkedin.controller';

@Module({
  controllers: [LinkedinController],
  providers: [LinkedinService],
  exports: [LinkedinService],
})
export class LinkedinModule {}
