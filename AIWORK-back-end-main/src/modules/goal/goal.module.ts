import { Module } from '@nestjs/common';
import { GoalController } from './controllers/goal.controller';
import { GoalService } from './services/goal.service';
import { ScoringModule } from '@modules/scoring/scoring.module';

@Module({
	imports: [ScoringModule],
	controllers: [GoalController],
	providers: [GoalService],
	exports: [GoalService],
})
export class GoalModule {}
