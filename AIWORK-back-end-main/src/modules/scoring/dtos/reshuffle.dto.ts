import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsUUID, IsOptional } from 'class-validator';

export class BatchRescoreDto {
	@ApiProperty({ description: 'User ID to rescore all tasks for' })
	@IsUUID('4')
	userId: string;
}

export class ReshuffleDto {
	@ApiProperty({ description: 'User ID' })
	@IsUUID('4')
	userId: string;

	@ApiProperty({ description: 'Task IDs to include in reshuffle', type: [String] })
	@IsArray()
	@IsUUID('4', { each: true })
	taskIds: string[];

	@ApiPropertyOptional({
		description: 'Task IDs that should keep their current position',
		type: [String],
	})
	@IsOptional()
	@IsArray()
	@IsUUID('4', { each: true })
	lockedTaskIds?: string[];
}
