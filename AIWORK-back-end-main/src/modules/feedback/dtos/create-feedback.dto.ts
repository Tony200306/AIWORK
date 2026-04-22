import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { SprintDifficulty } from '@prisma/client';

export class CreateFeedbackDto {
  @ApiPropertyOptional({ description: 'Sprint ID associated with this feedback' })
  @IsOptional()
  @IsUUID()
  sprintId?: string;

  @ApiProperty({
    enum: SprintDifficulty,
    description: 'How hard was this sprint for you?',
    example: SprintDifficulty.NORMAL,
  })
  @IsEnum(SprintDifficulty)
  difficulty: SprintDifficulty;

  @ApiPropertyOptional({
    description: 'Anything slow you down?',
    example: 'missing access, unclear event names',
  })
  @IsOptional()
  @IsString()
  slowdown?: string;
}
