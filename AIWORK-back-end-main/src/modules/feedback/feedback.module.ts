import { Module } from '@nestjs/common';
import { FeedbackController } from './controllers/feedback.controller';
import { FeedbackService } from './services/feedback.service';

@Module({
  controllers: [FeedbackController],
  providers: [FeedbackService],
  exports: [FeedbackService],
})
export class FeedbackModule {}
