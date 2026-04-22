import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

export class ReorderGoalItemDto {
	@ApiProperty({ description: 'Goal ID' })
	@IsString()
	@IsUUID()
	id: string;

	@ApiProperty({ example: 1, description: 'New rank' })
	@IsInt()
	@Min(1)
	rank: number;
}

export class ReorderGoalsDto {
	@ApiProperty({ type: [ReorderGoalItemDto], description: 'Goals with new ranks' })
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ReorderGoalItemDto)
	items: ReorderGoalItemDto[];
}
