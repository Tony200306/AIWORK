import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PresignedUrlDto {
	@ApiProperty({ required: false, example: 3600, description: 'URL expiration time in seconds (default: 3600, max: 604800)', minimum: 1, maximum: 604800 })
	@IsNumber()
	@IsOptional()
	@Type(() => Number)
	@Min(1)
	@Max(604800) // 7 days max
	expiresIn?: number;

	@ApiProperty({ required: false, example: 'vantum-files', description: 'Bucket name (optional, uses default if not provided)' })
	@IsString()
	@IsOptional()
	bucket?: string;
}

