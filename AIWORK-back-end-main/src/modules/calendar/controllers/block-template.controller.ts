import {
	Controller,
	Post,
	Get,
	Patch,
	Delete,
	Param,
	Body,
	Logger,
	BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { BlockTemplateService } from '../services/block-template.service';
import {
	CreateBlockTemplateDto,
	UpdateBlockTemplateDto,
	GenerateInstancesDto,
	BlockTemplateResponseDto,
} from '../dtos/block-template.dto';
import { CurrentUser } from '@decorators/current-user.decorator';

@ApiTags('Calendar - Templates')
@ApiBearerAuth('JWT-auth')
@Controller('calendar/templates')
export class BlockTemplateController {
	private readonly logger = new Logger(BlockTemplateController.name);

	constructor(private readonly blockTemplateService: BlockTemplateService) {}

	/**
	 * Create a new recurring block template
	 */
	@Post()
	@ApiOperation({ summary: 'Create a new recurring block template' })
	@ApiBody({ type: CreateBlockTemplateDto })
	async create(
		@Body() dto: CreateBlockTemplateDto,
		@CurrentUser() user?: any,
	): Promise<{ success: boolean; message: string; data: BlockTemplateResponseDto }> {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const template = await this.blockTemplateService.create(user.id, dto);

		return {
			success: true,
			message: 'Template created successfully',
			data: template,
		};
	}

	/**
	 * Get all templates for the user
	 */
	@Get()
	@ApiOperation({ summary: 'Get all block templates' })
	async findAll(
		@CurrentUser() user?: any,
	): Promise<{ success: boolean; data: BlockTemplateResponseDto[] }> {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const templates = await this.blockTemplateService.findAll(user.id);

		return {
			success: true,
			data: templates,
		};
	}

	/**
	 * Get a single template by ID
	 */
	@Get(':id')
	@ApiOperation({ summary: 'Get a block template by ID' })
	@ApiParam({ name: 'id', description: 'Template ID' })
	async findOne(
		@Param('id') id: string,
		@CurrentUser() user?: any,
	): Promise<{ success: boolean; data: BlockTemplateResponseDto }> {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const template = await this.blockTemplateService.findOne(id, user.id);

		return {
			success: true,
			data: template,
		};
	}

	/**
	 * Update a block template
	 */
	@Patch(':id')
	@ApiOperation({ summary: 'Update a block template' })
	@ApiParam({ name: 'id', description: 'Template ID' })
	@ApiBody({ type: UpdateBlockTemplateDto })
	async update(
		@Param('id') id: string,
		@Body() dto: UpdateBlockTemplateDto,
		@CurrentUser() user?: any,
	): Promise<{ success: boolean; message: string; data: BlockTemplateResponseDto }> {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const template = await this.blockTemplateService.update(id, user.id, dto);

		return {
			success: true,
			message: 'Template updated successfully',
			data: template,
		};
	}

	/**
	 * Delete a block template
	 */
	@Delete(':id')
	@ApiOperation({ summary: 'Delete a block template' })
	@ApiParam({ name: 'id', description: 'Template ID' })
	async delete(
		@Param('id') id: string,
		@CurrentUser() user?: any,
	): Promise<{ success: boolean; message: string }> {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		await this.blockTemplateService.delete(id, user.id);

		return {
			success: true,
			message: 'Template deleted successfully',
		};
	}

	/**
	 * Generate block instances from template
	 */
	@Post(':id/generate')
	@ApiOperation({ summary: 'Generate block instances from template for a date range' })
	@ApiParam({ name: 'id', description: 'Template ID' })
	@ApiBody({ type: GenerateInstancesDto })
	async generateInstances(
		@Param('id') id: string,
		@Body() dto: GenerateInstancesDto,
		@CurrentUser() user?: any,
	): Promise<{ success: boolean; message: string; data: { created: number } }> {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const result = await this.blockTemplateService.generateInstances(
			id,
			user.id,
			dto.startDate,
			dto.endDate,
		);

		return {
			success: true,
			message: `Generated ${result.created} instances`,
			data: result,
		};
	}
}
