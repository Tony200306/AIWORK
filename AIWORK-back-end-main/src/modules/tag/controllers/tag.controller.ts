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
import { TagService } from '../services/tag.service';
import { CreateTagDto } from '../dtos/create-tag.dto';
import { UpdateTagDto } from '../dtos/update-tag.dto';
import { CurrentUser } from '@decorators/current-user.decorator';

@ApiTags('Tags')
@ApiBearerAuth('JWT-auth')
@Controller('tags')
export class TagController {
	private readonly logger = new Logger(TagController.name);

	constructor(private readonly tagService: TagService) {}

	/**
	 * Create a new tag
	 */
	@Post()
	@ApiOperation({ summary: 'Create a new tag' })
	async create(
		@Body() createTagDto: CreateTagDto,
		@CurrentUser() user: any,
	) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const tag = await this.tagService.create(user.id, createTagDto);

		return {
			success: true,
			message: 'Tag created successfully',
			data: tag,
		};
	}

	/**
	 * Get all tags for current user
	 */
	@Get()
	@ApiOperation({ summary: 'Get all tags for current user' })
	async findAll(@CurrentUser() user: any) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}
		const tags = await this.tagService.findAll(user.id);
		return {
			success: true,
			data: tags,
		};
	}

	/**
	 * Get a single tag
	 */
	@Get(':id')
	@ApiOperation({ summary: 'Get a tag by ID' })
	@ApiParam({ name: 'id', description: 'Tag ID' })
	async findOne(
		@Param('id') id: string,
		@CurrentUser() user: any,
	) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const tag = await this.tagService.findOne(id, user.id);

		return {
			success: true,
			data: tag,
		};
	}

	/**
	 * Update a tag
	 */
	@Patch(':id')
	@ApiOperation({ summary: 'Update a tag' })
	@ApiParam({ name: 'id', description: 'Tag ID' })
	async update(
		@Param('id') id: string,
		@Body() updateTagDto: UpdateTagDto,
		@CurrentUser() user: any,
	) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		const tag = await this.tagService.update(id, user.id, updateTagDto);

		return {
			success: true,
			message: 'Tag updated successfully',
			data: tag,
		};
	}

	/**
	 * Delete a tag
	 */
	@Delete(':id')
	@ApiOperation({ summary: 'Delete a tag' })
	@ApiParam({ name: 'id', description: 'Tag ID' })
	async delete(
		@Param('id') id: string,
		@CurrentUser() user: any,
	) {
		if (!user?.id) {
			throw new BadRequestException('User authentication required');
		}

		await this.tagService.delete(id, user.id);

		return {
			success: true,
			message: 'Tag deleted successfully',
		};
	}
}
