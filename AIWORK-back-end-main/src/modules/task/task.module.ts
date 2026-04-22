import { Module } from '@nestjs/common';
import { TaskController } from './controllers/task.controller';
import { TaskService } from './services/task.service';
import { ScoringModule } from '@modules/scoring/scoring.module';

@Module({
	imports: [ScoringModule],
	controllers: [TaskController],
	providers: [TaskService],
	exports: [TaskService],
})
export class TaskModule {}
