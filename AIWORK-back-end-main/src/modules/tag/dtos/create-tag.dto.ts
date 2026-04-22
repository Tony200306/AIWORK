import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsHexColor, IsUUID } from 'class-validator';

export class CreateTagDto {
	@ApiProperty({
		example: 'Client A',
		description: 'Tag name',
	})
	@IsString()
	name: string;

	@ApiPropertyOptional({
		example: '#FF5733',
		description: 'Hex color for the tag',
	})
	@IsOptional()
	@IsHexColor()
	color?: string;

	@ApiPropertyOptional({
		description: 'Parent tag ID for hierarchical tags',
	})
	@IsOptional()
	@IsUUID()
	parentId?: string;
}
