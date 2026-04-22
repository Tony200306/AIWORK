import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ScoreTaskDto {
	@ApiProperty({ description: 'Task ID to score' })
	@IsUUID('4')
	taskId: string;
}
