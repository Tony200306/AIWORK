import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionResponseDto {
	@ApiProperty({
		description: 'Subscription ID from Beehiiv',
		example: 'sub_abc123',
	})
	id: string;

	@ApiProperty({
		description: 'Subscribed email address',
		example: 'user@example.com',
	})
	email: string;

	@ApiProperty({
		description: 'Subscription status',
		example: 'active',
	})
	status: string;

	@ApiProperty({
		description: 'Timestamp when subscription was created',
		example: 1704067200,
	})
	created: number;
}

export class NewsletterSuccessResponseDto {
	@ApiProperty({
		description: 'Indicates if the operation was successful',
		example: true,
	})
	success: boolean;

	@ApiProperty({
		description: 'Response message',
		example: 'Successfully subscribed to newsletter',
	})
	message: string;

	@ApiProperty({
		description: 'Subscription data',
		type: SubscriptionResponseDto,
	})
	data: SubscriptionResponseDto;
}

export class NewsletterUnsubscribeResponseDto {
	@ApiProperty({
		description: 'Indicates if the operation was successful',
		example: true,
	})
	success: boolean;

	@ApiProperty({
		description: 'Response message',
		example: 'Successfully unsubscribed from newsletter',
	})
	message: string;
}
