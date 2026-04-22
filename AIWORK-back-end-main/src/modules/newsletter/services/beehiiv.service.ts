import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { beehiivConfig } from '@config/beehiiv.config';

export interface SubscribeDto {
	name: string;
	email: string;
	utmSource?: string;
	utmMedium?: string;
	utmCampaign?: string;
	tags?: string[];
	tasks?: string[];
}

export interface BeehiivSubscriptionResponse {
	id: string;
	email: string;
	status: string;
	created: number;
}

@Injectable()
export class BeehiivService {
	private readonly logger = new Logger(BeehiivService.name);
	private readonly baseUrl: string;
	private readonly apiKey: string;
	private readonly publicationId: string;
	private readonly enabled: boolean;

	constructor() {
		this.baseUrl = beehiivConfig.baseUrl;
		this.apiKey = beehiivConfig.apiKey;
		this.publicationId = beehiivConfig.publicationId;
		this.enabled = beehiivConfig.enabled;
	}

	async subscribe(dto: SubscribeDto): Promise<BeehiivSubscriptionResponse> {
		if (!this.enabled) {
			this.logger.warn('Beehiiv integration is disabled');
			throw new HttpException(
				'Newsletter subscription is currently unavailable',
				HttpStatus.SERVICE_UNAVAILABLE,
			);
		}

		if (!this.apiKey || !this.publicationId) {
			this.logger.error('Beehiiv API key or publication ID not configured');
			throw new HttpException(
				'Newsletter service not configured',
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}

		const url = `${this.baseUrl}/publications/${this.publicationId}/subscriptions`;

		const body: Record<string, unknown> = {
			email: dto.email,
			reactivate_existing: true,
			send_welcome_email: true,
		};

		// Build custom fields array
		const customFields: Array<{ name: string; value: string }> = [];

		if (dto.name) {
			customFields.push({ name: 'name', value: dto.name });
		}
		if (dto.tasks && dto.tasks.length > 0) {
			// Beehiiv custom fields only support strings, so join array as comma-separated
			customFields.push({ name: 'tasks', value: dto.tasks.join(', ') });
		}

		if (customFields.length > 0) {
			body.custom_fields = customFields;
		}

		if (dto.utmSource) body.utm_source = dto.utmSource;
		if (dto.utmMedium) body.utm_medium = dto.utmMedium;
		if (dto.utmCampaign) body.utm_campaign = dto.utmCampaign;
		if (dto.tags && dto.tags.length > 0) body.tags = dto.tags;

		try {
			this.logger.log(`Subscribing email to Beehiiv: ${dto.email}`);

			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${this.apiKey}`,
				},
				body: JSON.stringify(body),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				this.logger.error(
					`Beehiiv API error: ${response.status} - ${JSON.stringify(errorData)}`,
				);

				if (response.status === 400) {
					throw new HttpException(
						errorData.message || 'Invalid email address',
						HttpStatus.BAD_REQUEST,
					);
				}

				throw new HttpException(
					'Failed to subscribe to newsletter',
					HttpStatus.BAD_GATEWAY,
				);
			}

			const result = await response.json();
			this.logger.log(`Successfully subscribed: ${dto.email}`);

			return {
				id: result.data?.id || result.id,
				email: result.data?.email || dto.email,
				status: result.data?.status || 'active',
				created: result.data?.created || Date.now(),
			};
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}

			this.logger.error(`Failed to subscribe to Beehiiv: ${error.message}`);
			throw new HttpException(
				'Newsletter subscription failed',
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	async unsubscribe(email: string): Promise<void> {
		if (!this.enabled) {
			this.logger.warn('Beehiiv integration is disabled');
			throw new HttpException(
				'Newsletter service is currently unavailable',
				HttpStatus.SERVICE_UNAVAILABLE,
			);
		}

		const url = `${this.baseUrl}/publications/${this.publicationId}/subscriptions/${encodeURIComponent(email)}`;

		try {
			const response = await fetch(url, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${this.apiKey}`,
				},
			});

			if (!response.ok && response.status !== 404) {
				this.logger.error(`Failed to unsubscribe: ${response.status}`);
				throw new HttpException(
					'Failed to unsubscribe from newsletter',
					HttpStatus.BAD_GATEWAY,
				);
			}

			this.logger.log(`Successfully unsubscribed: ${email}`);
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}

			this.logger.error(`Failed to unsubscribe: ${error.message}`);
			throw new HttpException(
				'Newsletter unsubscription failed',
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}
}
