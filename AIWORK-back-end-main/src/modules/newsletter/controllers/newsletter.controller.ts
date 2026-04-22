import { Controller, Post, Delete, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Public } from '@decorators/public.decorator';
import { BeehiivService } from '../services/beehiiv.service';
import { NewsletterRepository } from '../services/newsletter.repository';
import {
	SubscribeNewsletterDto,
	UnsubscribeNewsletterDto,
	NewsletterSuccessResponseDto,
	NewsletterUnsubscribeResponseDto,
} from '../dtos';

@ApiTags('Newsletter')
@Controller('newsletter')
export class NewsletterController {
	private readonly logger = new Logger(NewsletterController.name);

	constructor(
		private readonly beehiivService: BeehiivService,
		private readonly newsletterRepository: NewsletterRepository,
	) {}

	@Public()
	@Post('subscribe')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Subscribe to newsletter' })
	@ApiResponse({
		status: 200,
		description: 'Successfully subscribed to newsletter',
		type: NewsletterSuccessResponseDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Invalid email address',
	})
	@ApiResponse({
		status: 503,
		description: 'Newsletter service unavailable',
	})
	@ApiBody({ type: SubscribeNewsletterDto })
	async subscribe(
		@Body() dto: SubscribeNewsletterDto,
	): Promise<NewsletterSuccessResponseDto> {
		// Subscribe to Beehiiv
		const result = await this.beehiivService.subscribe({
			name: dto.name,
			email: dto.email,
			tasks: dto.tasks,
			tags: dto.tags,
			utmSource: dto.utmSource,
			utmMedium: dto.utmMedium,
			utmCampaign: dto.utmCampaign,
		});

		// Save to database
		try {
			await this.newsletterRepository.upsert({
				name: dto.name,
				email: dto.email,
				tasks: dto.tasks,
				beehiivSubscriptionId: result.id,
			});
			this.logger.log(`Saved subscription to database: ${dto.email}`);
		} catch (error) {
			this.logger.error(`Failed to save subscription to database: ${error.message}`);
			// Don't fail the request if DB save fails - Beehiiv subscription succeeded
		}

		return {
			success: true,
			message: 'Successfully subscribed to newsletter',
			data: result,
		};
	}

	@Public()
	@Delete('unsubscribe')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Unsubscribe from newsletter' })
	@ApiResponse({
		status: 200,
		description: 'Successfully unsubscribed from newsletter',
		type: NewsletterUnsubscribeResponseDto,
	})
	@ApiResponse({
		status: 503,
		description: 'Newsletter service unavailable',
	})
	async unsubscribe(
		@Body() dto: UnsubscribeNewsletterDto,
	): Promise<NewsletterUnsubscribeResponseDto> {
		// Unsubscribe from Beehiiv
		await this.beehiivService.unsubscribe(dto.email);

		// Mark as unsubscribed in database
		try {
			await this.newsletterRepository.markUnsubscribed(dto.email);
			this.logger.log(`Marked subscription as unsubscribed in database: ${dto.email}`);
		} catch (error) {
			this.logger.error(`Failed to update database: ${error.message}`);
		}

		return {
			success: true,
			message: 'Successfully unsubscribed from newsletter',
		};
	}
}
