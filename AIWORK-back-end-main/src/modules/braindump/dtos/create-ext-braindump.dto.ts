import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateExtBrainDumpDto {
	@ApiPropertyOptional({
		example: 'Meeting notes from today about the new feature',
		description: 'Context/description of the brain dump',
	})
	@IsString()
	@IsOptional()
	contextText?: string;
}
