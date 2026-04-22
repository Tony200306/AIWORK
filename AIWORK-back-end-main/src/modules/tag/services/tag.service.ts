import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { CreateTagDto } from '../dtos/create-tag.dto';
import { UpdateTagDto } from '../dtos/update-tag.dto';
import { TagType } from '@prisma/client';

@Injectable()
export class TagService {
	private readonly logger = new Logger(TagService.name);

	constructor(private readonly prisma: PrismaService) {}

	/**
	 * Create a new tag for a user
	 */
	async create(userId: string, data: CreateTagDto) {
		const tag = await this.prisma.tag.create({
			data: {
				userId,
				name: data.name,
				color: data.color,
				parentId: data.parentId,
				type: TagType.TODO, // Default type
			},
		});

		this.logger.log(`Tag created: ${tag.id} for user ${userId}`);
		return tag;
	}

	/**
	 * Get all tags for a user
	 */
	async findAll(userId: string) {
		return this.prisma.tag.findMany({
			where: { userId },
			orderBy: { name: 'asc' },
			include: {
				children: true,
				_count: {
					select: { taskTags: true },
				},
			},
		});
	}

	/**
	 * Get a single tag by ID
	 */
	async findOne(id: string, userId: string) {
		const tag = await this.prisma.tag.findUnique({
			where: { id },
			include: {
				children: true,
				_count: {
					select: { taskTags: true },
				},
			},
		});

		if (!tag) {
			throw new NotFoundException(`Tag with ID ${id} not found`);
		}

		if (tag.userId !== userId) {
			throw new ForbiddenException('Access denied to this tag');
		}

		return tag;
	}

	/**
	 * Update a tag
	 */
	async update(id: string, userId: string, data: UpdateTagDto) {
		// Verify ownership
		await this.findOne(id, userId);

		const updated = await this.prisma.tag.update({
			where: { id },
			data: {
				name: data.name,
				color: data.color,
				parentId: data.parentId,
			},
		});

		this.logger.log(`Tag updated: ${id}`);
		return updated;
	}

	/**
	 * Delete a tag
	 */
	async delete(id: string, userId: string) {
		// Verify ownership
		await this.findOne(id, userId);

		const deleted = await this.prisma.tag.delete({
			where: { id },
		});

		this.logger.log(`Tag deleted: ${id}`);
		return deleted;
	}
}
