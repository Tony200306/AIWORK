import { Controller, Post, Body, Logger, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '@decorators/current-user.decorator';
import { CompositeScorerService } from '../services/composite-scorer.service';
import { ScoreTaskDto } from '../dtos/score-task.dto';
import { BatchRescoreDto } from '../dtos/reshuffle.dto';
import { ReshuffleDto } from '../dtos/reshuffle.dto';

@ApiTags('Scoring')
@ApiBearerAuth('JWT-auth')
@Controller('scoring')
export class ScoringController {
	private readonly logger = new Logger(ScoringController.name);

	constructor(private readonly scorer: CompositeScorerService) {}

	@Post('score-task')
	@ApiOperation({ summary: 'Score a single task' })
	async scoreTask(
		@Body() dto: ScoreTaskDto,
		@CurrentUser() user: any,
	) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}
		const result = await this.scorer.scoreTask(dto.taskId);
		return { success: true, data: result };
	}

	@Post('batch-rescore')
	@ApiOperation({ summary: 'Rescore all tasks for current user' })
	async batchRescore(@CurrentUser() user: any) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}
		const result = await this.scorer.batchRescoreUser(user.id);
		return { success: true, data: result };
	}

	@Post('reshuffle')
	@ApiOperation({ summary: 'Lock-aware reshuffle by composite score' })
	async reshuffle(
		@Body() dto: ReshuffleDto,
		@CurrentUser() user: any,
	) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}
		const result = await this.scorer.reshuffleByCompositeScore(
			user.id,
			dto.taskIds,
			dto.lockedTaskIds,
		);
		return { success: true, data: result };
	}
}
