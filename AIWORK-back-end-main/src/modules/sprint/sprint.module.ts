import { Module } from '@nestjs/common';
import { SprintController } from './controllers/sprint.controller';
import { SprintService } from './services/sprint.service';

@Module({
	controllers: [SprintController],
	providers: [SprintService],
	exports: [SprintService],
})
export class SprintModule {}
