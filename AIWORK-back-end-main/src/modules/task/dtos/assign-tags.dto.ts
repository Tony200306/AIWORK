import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class AssignTagsDto {
	@ApiProperty({
		type: [String],
		description: 'Array of tag IDs to assign to the task',
		example: ['uuid-1', 'uuid-2'],
	})
	@IsArray()
	@IsUUID('4', { each: true })
	tagIds: string[];
}
