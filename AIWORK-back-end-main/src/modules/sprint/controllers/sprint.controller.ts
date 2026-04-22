import {
	Controller,
	Get,
	Post,
	Patch,
	Delete,
	Param,
	Body,
	Query,
	Logger,
	BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { SprintService } from '../services/sprint.service';
import { CreateSprintDto } from '../dtos/create-sprint.dto';
import { UpdateSprintDto } from '../dtos/update-sprint.dto';
import { AddSprintItemDto } from '../dtos/add-sprint-item.dto';
import { UpdateSprintItemDto } from '../dtos/update-sprint-item.dto';
import { SprintQueryDto } from '../dtos/sprint-query.dto';
import { CurrentUser } from '@decorators/current-user.decorator';

@ApiTags('Sprints')
@ApiBearerAuth('JWT-auth')
@Controller('sprints')
export class SprintController {
	private readonly logger = new Logger(SprintController.name);

	constructor(private readonly sprintService: SprintService) {}

	// ==================== SPRINT CRUD ====================

	/**
	 * Create a new sprint
	 */
	@Post()
	@ApiOperation({ summary: 'Create a new sprint' })
	async create(@Body() createSprintDto: CreateSprintDto, @CurrentUser() user: any) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const sprint = await this.sprintService.create(user.id, createSprintDto);

		return {
			success: true,
			message: 'Sprint created successfully',
			data: sprint,
		};
	}

	/**
	 * Get all sprints with pagination
	 */
	@Get()
	@ApiOperation({ summary: 'Get all sprints for current user with pagination' })
	async findAll(@Query() query: SprintQueryDto, @CurrentUser() user: any) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const result = await this.sprintService.findAll(user.id, query);

		return {
			data: result.data,
			message: 'OK',
			statusCode: 200,
			pages: result.pagination,
		};
	}

	/**
	 * Get current active sprint
	 */
	@Get('active')
	@ApiOperation({ summary: 'Get the current active sprint' })
	async findActive(@CurrentUser() user: any) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const sprint = await this.sprintService.findActive(user.id);

		return {
			success: true,
			data: sprint,
		};
	}

	/**
	 * Get a single sprint with items by lane
	 */
	@Get(':id')
	@ApiOperation({ summary: 'Get a sprint by ID with items organized by lane' })
	@ApiParam({ name: 'id', description: 'Sprint ID' })
	async findOne(@Param('id') id: string, @CurrentUser() user: any) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const sprint = await this.sprintService.findOne(id, user.id);

		return {
			success: true,
			data: sprint,
		};
	}

	/**
	 * Update a sprint
	 */
	@Patch(':id')
	@ApiOperation({ summary: 'Update a sprint' })
	@ApiParam({ name: 'id', description: 'Sprint ID' })
	async update(@Param('id') id: string, @Body() updateSprintDto: UpdateSprintDto, @CurrentUser() user: any) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const sprint = await this.sprintService.update(id, user.id, updateSprintDto);

		return {
			success: true,
			message: 'Sprint updated successfully',
			data: sprint,
		};
	}

	/**
	 * Delete a sprint
	 */
	@Delete(':id')
	@ApiOperation({ summary: 'Delete a sprint' })
	@ApiParam({ name: 'id', description: 'Sprint ID' })
	async delete(@Param('id') id: string, @CurrentUser() user: any) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		await this.sprintService.delete(id, user.id);

		return {
			success: true,
			message: 'Sprint deleted successfully',
		};
	}

	/**
	 * Commit/activate a sprint
	 */
	@Post(':id/commit')
	@ApiOperation({ summary: 'Commit and activate a sprint (deactivates other sprints)' })
	@ApiParam({ name: 'id', description: 'Sprint ID' })
	async commit(@Param('id') id: string, @CurrentUser() user: any) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const sprint = await this.sprintService.commit(id, user.id);

		return {
			success: true,
			message: 'Sprint committed successfully',
			data: sprint,
		};
	}

	/**
	 * Get sprint summary/capacity stats
	 */
	@Get(':id/summary')
	@ApiOperation({ summary: 'Get sprint capacity summary statistics' })
	@ApiParam({ name: 'id', description: 'Sprint ID' })
	async getSummary(@Param('id') id: string, @CurrentUser() user: any) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const summary = await this.sprintService.getSummary(id, user.id);

		return {
			success: true,
			data: summary,
		};
	}

	// ==================== SPRINT ITEM CRUD ====================

	/**
	 * Add a task to a sprint
	 */
	@Post(':sprintId/items')
	@ApiOperation({ summary: 'Add a task to a sprint' })
	@ApiParam({ name: 'sprintId', description: 'Sprint ID' })
	async addItem(
		@Param('sprintId') sprintId: string,
		@Body() addSprintItemDto: AddSprintItemDto,
		@CurrentUser() user: any,
	) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const item = await this.sprintService.addItem(sprintId, user.id, addSprintItemDto);

		return {
			success: true,
			message: 'Task added to sprint successfully',
			data: item,
		};
	}

	/**
	 * Update a sprint item (properties, lane change, and/or reorder)
	 * Supports drag & drop by passing lane + rank together
	 */
	@Patch(':sprintId/items/:itemId')
	@ApiOperation({
		summary: 'Update a sprint item (supports lane change and reorder)',
		description:
			'Update item properties. For drag & drop, pass lane and/or rank. Uses transaction-safe "parking rank" pattern for concurrent safety.',
	})
	@ApiParam({ name: 'sprintId', description: 'Sprint ID' })
	@ApiParam({ name: 'itemId', description: 'Sprint Item ID' })
	async updateItem(
		@Param('sprintId') sprintId: string,
		@Param('itemId') itemId: string,
		@Body() updateSprintItemDto: UpdateSprintItemDto,
		@CurrentUser() user: any,
	) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const item = await this.sprintService.updateItem(sprintId, itemId, user.id, updateSprintItemDto);

		return {
			success: true,
			message: 'Sprint item updated successfully',
			data: item,
		};
	}

	/**
	 * Remove a task from a sprint
	 */
	@Delete(':sprintId/items/:itemId')
	@ApiOperation({ summary: 'Remove a task from a sprint' })
	@ApiParam({ name: 'sprintId', description: 'Sprint ID' })
	@ApiParam({ name: 'itemId', description: 'Sprint Item ID' })
	async removeItem(
		@Param('sprintId') sprintId: string,
		@Param('itemId') itemId: string,
		@CurrentUser() user: any,
	) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		await this.sprintService.removeItem(sprintId, itemId, user.id);

		return {
			success: true,
			message: 'Task removed from sprint successfully',
		};
	}

	// ==================== AI PLACEHOLDERS ====================

	/**
	 * AI Auto-plan placeholder
	 * TODO: Integrate with AI service
	 */
	@Post(':id/auto-plan')
	@ApiOperation({ summary: '[AI Placeholder] Auto-assign tasks to sprint based on AI recommendations' })
	@ApiParam({ name: 'id', description: 'Sprint ID' })
	async autoPlan(@Param('id') id: string, @CurrentUser() user: any) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const result = await this.sprintService.autoPlan(id, user.id);

		return {
			success: true,
			data: result,
		};
	}
}
