import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, Allow } from 'class-validator';

export class CreateBrainDumpDto {
	@ApiPropertyOptional({
		example: 'Meeting notes from today about the new feature',
		description: 'Context/description of the brain dump',
	})
	@IsString()
	@IsOptional()
	contextText?: string;

	@ApiPropertyOptional({
		type: 'array',
		items: { type: 'string', format: 'binary' },
		description: 'File attachments (up to 10 files)',
	})
	@Allow()
	attachments?: Express.Multer.File[];
}
