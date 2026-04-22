import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateSchedulePreferenceDto {
	@ApiPropertyOptional({
		description: 'Weekly capacity in minutes',
		example: 1890,
	})
	@IsOptional()
	@IsNumber()
	@Min(0)
	weeklyCapacityMinutes?: number;

	@ApiPropertyOptional({
		description: 'Daily capacity in minutes',
		example: 480,
	})
	@IsOptional()
	@IsNumber()
	@Min(0)
	dailyCapacityMinutes?: number;

	@ApiPropertyOptional({
		description: 'Default focus session duration in minutes',
		example: 60,
	})
	@IsOptional()
	@IsNumber()
	@Min(1)
	defaultFocusMinutes?: number;
}
