import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class ListFilesDto {
	@ApiProperty({ required: false, example: 'uploads/', description: 'Prefix to filter files' })
	@IsString()
	@IsOptional()
	prefix?: string;

	@ApiProperty({ required: false, example: 'vantum-files', description: 'Bucket name (optional, uses default if not provided)' })
	@IsString()
	@IsOptional()
	bucket?: string;
}

