import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * DTO for file upload options
 * The file itself is handled via multipart/form-data
 */
export class UploadFileDto {
	@ApiProperty({
		required: false,
		description: 'Custom storage path prefix (e.g., "documents", "images")',
		example: 'uploads',
	})
	@IsOptional()
	@IsString()
	prefix?: string;

	@ApiProperty({
		required: false,
		description: 'Custom filename override (without extension)',
	})
	@IsOptional()
	@IsString()
	filename?: string;
}
