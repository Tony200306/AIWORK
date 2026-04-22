import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuestionType } from '@prisma/client';
import { IsString, IsOptional, IsEnum, IsInt, IsBoolean } from 'class-validator';



export class CreateQuestionCardDto {
    @ApiProperty({ description: 'Unique slug identifier', example: 'capacity-reality' })
    @IsString()
    slug: string;

    @ApiProperty({ description: 'Display order index', example: 1 })
    @IsInt()
    orderIndex: number;

    @ApiProperty({ description: 'Card title', example: 'Capacity Reality' })
    @IsString()
    title: string;

    @ApiPropertyOptional({ description: 'Card subtitle', example: 'Logical' })
    @IsOptional()
    @IsString()
    subtitle?: string;

    @ApiProperty({ description: 'Question text', example: 'What does a realistic week look like?' })
    @IsString()
    question: string;

    @ApiProperty({ enum: QuestionType, description: 'Question type' })
    @IsEnum(QuestionType)
    type: QuestionType;

    @ApiPropertyOptional({
        description: 'Options for select questions',
        example: [{ value: 'deep', label: 'Deep focus blocks' }],
    })
    @IsOptional()
    options?: Record<string, any>;

    @ApiPropertyOptional({
        description: 'Config for slider/input questions',
        example: { min: 0, max: 60, step: 5, unit: 'hours' },
    })
    @IsOptional()
    config?: Record<string, any>;

    @ApiPropertyOptional({ description: 'Is card active', default: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}