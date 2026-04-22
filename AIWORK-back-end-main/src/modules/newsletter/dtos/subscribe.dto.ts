import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class SubscribeNewsletterDto {
	@ApiProperty({
		description: 'Name of the subscriber',
		example: 'John Doe',
	})
	@IsString()
	@MaxLength(200)
	name: string;

	@ApiProperty({
		description: 'Email address to subscribe',
		example: 'user@example.com',
	})
	@IsEmail()
	email: string;

	@ApiPropertyOptional({
		description: 'List of tasks',
		example: ['task1', 'task2', 'task3'],
		type: [String],
	})
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	tasks?: string[];

	@ApiPropertyOptional({
		description: 'Tags to apply to the subscriber for segmentation',
		example: ['capacity_report', 'onboarding'],
		type: [String],
	})
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	tags?: string[];

	@ApiPropertyOptional({
		description: 'UTM source for tracking',
		example: 'capacity_report',
	})
	@IsOptional()
	@IsString()
	@MaxLength(100)
	utmSource?: string;

	@ApiPropertyOptional({
		description: 'UTM medium for tracking',
		example: 'web',
	})
	@IsOptional()
	@IsString()
	@MaxLength(100)
	utmMedium?: string;

	@ApiPropertyOptional({
		description: 'UTM campaign for tracking',
		example: 'onboarding',
	})
	@IsOptional()
	@IsString()
	@MaxLength(100)
	utmCampaign?: string;
}

export class UnsubscribeNewsletterDto {
	@ApiProperty({
		description: 'Email address to unsubscribe',
		example: 'user@example.com',
	})
	@IsEmail()
	email: string;
}
