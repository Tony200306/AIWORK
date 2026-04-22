import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { NewsletterSubscription } from '@prisma/client';

export interface CreateSubscriptionDto {
	name: string;
	email: string;
	tasks?: string[];
	beehiivSubscriptionId?: string;
}

@Injectable()
export class NewsletterRepository {
	private readonly logger = new Logger(NewsletterRepository.name);

	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreateSubscriptionDto): Promise<NewsletterSubscription> {
		return this.prisma.newsletterSubscription.create({
			data: {
				name: dto.name,
				email: dto.email,
				tasks: dto.tasks || [],
				beehiivSubscriptionId: dto.beehiivSubscriptionId,
			},
		});
	}

	async findByEmail(email: string): Promise<NewsletterSubscription | null> {
		return this.prisma.newsletterSubscription.findUnique({
			where: { email },
		});
	}

	async upsert(dto: CreateSubscriptionDto): Promise<NewsletterSubscription> {
		return this.prisma.newsletterSubscription.upsert({
			where: { email: dto.email },
			update: {
				name: dto.name,
				tasks: dto.tasks || [],
				beehiivSubscriptionId: dto.beehiivSubscriptionId,
				unsubscribedAt: null, // Reactivate if previously unsubscribed
				subscribedAt: new Date(),
			},
			create: {
				name: dto.name,
				email: dto.email,
				tasks: dto.tasks || [],
				beehiivSubscriptionId: dto.beehiivSubscriptionId,
			},
		});
	}

	async markUnsubscribed(email: string): Promise<NewsletterSubscription | null> {
		const subscription = await this.findByEmail(email);
		if (!subscription) {
			return null;
		}

		return this.prisma.newsletterSubscription.update({
			where: { email },
			data: { unsubscribedAt: new Date() },
		});
	}

	async findAll(): Promise<NewsletterSubscription[]> {
		return this.prisma.newsletterSubscription.findMany({
			orderBy: { subscribedAt: 'desc' },
		});
	}

	async findActive(): Promise<NewsletterSubscription[]> {
		return this.prisma.newsletterSubscription.findMany({
			where: { unsubscribedAt: null },
			orderBy: { subscribedAt: 'desc' },
		});
	}
}
