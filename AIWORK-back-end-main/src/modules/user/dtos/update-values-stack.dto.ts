import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { ValueEnum } from '@prisma/client';

export class UpdateValuesStackDto {
	@ApiProperty({
		enum: ValueEnum,
		isArray: true,
		example: ['DEEP_WORK', 'CLIENT_TRUST', 'CRAFT'],
		description: 'Exactly 3 values ordered by priority',
	})
	@IsArray()
	@IsEnum(ValueEnum, { each: true })
	@ArrayMinSize(3)
	@ArrayMaxSize(3)
	valuesStack: ValueEnum[];
}
