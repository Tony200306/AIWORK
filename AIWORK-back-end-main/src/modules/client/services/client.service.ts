import {
	Injectable,
	Logger,
	NotFoundException,
	ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { CreateClientDto } from '../dtos/create-client.dto';
import { UpdateClientDto } from '../dtos/update-client.dto';
import {
	computeDisposition,
	computeClientWeight,
} from '../utils/client-weight.util';
import { CompositeScorerService } from '@modules/scoring/services/composite-scorer.service';

@Injectable()
export class ClientService {
	private readonly logger = new Logger(ClientService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly scorer: CompositeScorerService,
	) {}

	/**
	 * Create a new client for a user with auto-computed disposition and weight
	 */
	async create(userId: string, data: CreateClientDto) {
		const disposition = computeDisposition(
			data.relationshipState,
		);
		const clientWeight = computeClientWeight(
			data.revenueRange,
			data.relationshipState,
			disposition,
		);

		const client = await this.prisma.client.create({
			data: {
				userId,
				name: data.name,
				revenueRange: data.revenueRange,
				relationshipState:
					data.relationshipState,
				disposition,
				clientWeight,
			},
		});

		this.logger.log(
			`Client created: ${client.id} for user ${userId}`,
		);
		return client;
	}

	/**
	 * Get all clients for a user
	 */
	async findAll(userId: string) {
		return this.prisma.client.findMany({
			where: { userId },
			orderBy: { name: 'asc' },
		});
	}

	/**
	 * Get a single client by ID with ownership check
	 */
	async findOne(id: string, userId: string) {
		const client = await this.prisma.client.findUnique({
			where: { id },
		});

		if (!client) {
			throw new NotFoundException(
				`Client with ID ${id} not found`,
			);
		}

		if (client.userId !== userId) {
			throw new ForbiddenException(
				'Access denied to this client',
			);
		}

		return client;
	}

	/**
	 * Update a client (recompute weight on change)
	 */
	async update(id: string, userId: string, data: UpdateClientDto) {
		const existing = await this.findOne(id, userId);

		const revenueRange =
			data.revenueRange ?? existing.revenueRange;
		const relationshipState =
			data.relationshipState ??
			existing.relationshipState;
		const disposition = computeDisposition(relationshipState);
		const clientWeight = computeClientWeight(
			revenueRange,
			relationshipState,
			disposition,
		);

		const updated = await this.prisma.client.update({
			where: { id },
			data: {
				name: data.name,
				revenueRange: data.revenueRange,
				relationshipState:
					data.relationshipState,
				disposition,
				clientWeight,
			},
		});

		this.logger.log(`Client updated: ${id}`);

		// Cascade rescore all tasks linked to this client
		this.cascadeRescoreByClient(id).catch((err) =>
			this.logger.warn(
				`Failed to cascade rescore for client ${id}: ${err.message}`,
			),
		);

		return updated;
	}

	private async cascadeRescoreByClient(clientId: string) {
		const tasks = await this.prisma.task.findMany({
			where: { clientId },
			select: { id: true },
		});
		await Promise.all(
			tasks.map((t) =>
				this.scorer
					.scoreTask(t.id)
					.catch((err) =>
						this.logger.warn(
							`Failed to rescore task ${t.id}: ${err.message}`,
						),
					),
			),
		);
	}

	/**
	 * Delete a client
	 */
	async delete(id: string, userId: string) {
		await this.findOne(id, userId);

		const deleted = await this.prisma.client.delete({
			where: { id },
		});

		this.logger.log(`Client deleted: ${id}`);
		return deleted;
	}
}
