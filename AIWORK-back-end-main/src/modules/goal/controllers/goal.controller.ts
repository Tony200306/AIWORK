import {
	Controller,
	Get,
	Post,
	Patch,
	Delete,
	Param,
	Body,
	Logger,
	BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { GoalService } from '../services/goal.service';
import { CreateGoalDto } from '../dtos/create-goal.dto';
import { UpdateGoalDto } from '../dtos/update-goal.dto';
import { ReorderGoalsDto } from '../dtos/reorder-goals.dto';
import { CurrentUser } from '@decorators/current-user.decorator';

@ApiTags('Goals')
@ApiBearerAuth('JWT-auth')
@Controller('goals')
export class GoalController {
	private readonly logger = new Logger(GoalController.name);

	constructor(private readonly goalService: GoalService) {}

	@Post()
	@ApiOperation({ summary: 'Create a new goal' })
	async create(
		@Body() createGoalDto: CreateGoalDto,
		@CurrentUser() user: any,
	) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const goal = await this.goalService.create(user.id, createGoalDto);

		return {
			success: true,
			message: 'Goal created successfully',
			data: goal,
		};
	}

	@Get()
	@ApiOperation({ summary: 'Get all goals for current user' })
	async findAll(@CurrentUser() user: any) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const goals = await this.goalService.findAll(user.id);

		return {
			success: true,
			data: goals,
		};
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get a goal by ID' })
	@ApiParam({ name: 'id', description: 'Goal ID' })
	async findOne(
		@Param('id') id: string,
		@CurrentUser() user: any,
	) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const goal = await this.goalService.findOne(id, user.id);

		return {
			success: true,
			data: goal,
		};
	}

	@Patch('reorder')
	@ApiOperation({ summary: 'Bulk reorder goals' })
	async reorder(
		@Body() reorderGoalsDto: ReorderGoalsDto,
		@CurrentUser() user: any,
	) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const goals = await this.goalService.reorder(user.id, reorderGoalsDto.items);

		return {
			success: true,
			message: 'Goals reordered successfully',
			data: goals,
		};
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update a goal' })
	@ApiParam({ name: 'id', description: 'Goal ID' })
	async update(
		@Param('id') id: string,
		@Body() updateGoalDto: UpdateGoalDto,
		@CurrentUser() user: any,
	) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const goal = await this.goalService.update(id, user.id, updateGoalDto);

		return {
			success: true,
			message: 'Goal updated successfully',
			data: goal,
		};
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete a goal' })
	@ApiParam({ name: 'id', description: 'Goal ID' })
	async delete(
		@Param('id') id: string,
		@CurrentUser() user: any,
	) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		await this.goalService.delete(id, user.id);

		return {
			success: true,
			message: 'Goal deleted successfully',
		};
	}
}
