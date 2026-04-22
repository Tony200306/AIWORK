import {
	Controller,
	Post,
	Body,
	Logger,
	BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { OnboardingService } from '../services/onboarding.service';
import {
	OnboardingBrainDumpInputDto,
	OnboardingBrainDumpOutputDto,
} from '../dtos/onboarding-braindump.dto';
import {
	ExtractProfileInputDto,
	ExtractProfileOutputDto,
} from '../dtos/extract-profile.dto';
import { CurrentUser } from '@decorators/current-user.decorator';

@ApiTags('Onboarding')
@ApiBearerAuth('JWT-auth')
@Controller('onboarding')
export class OnboardingController {
	private readonly logger = new Logger(OnboardingController.name);

	constructor(private readonly onboardingService: OnboardingService) {}

	/**
	 * Process onboarding braindump to generate tasks
	 */
	@Post('braindump')
	@ApiOperation({
		summary: 'Process onboarding braindump to generate tasks',
	})
	@ApiBody({ type: OnboardingBrainDumpInputDto })
	async braindump(
		@Body() input: OnboardingBrainDumpInputDto,
		@CurrentUser() user?: any,
	): Promise<{
		success: boolean;
		message: string;
		data: OnboardingBrainDumpOutputDto;
	}> {
		try {
			if (!user || !user.id) {
				throw new BadRequestException(
					'User authentication required',
				);
			}

			this.logger.log(
				`Processing onboarding braindump for user ${user.id}`,
			);

			const result =
				await this.onboardingService.braindump(
					input,
				);

			return {
				success: true,
				message: 'Onboarding braindump processed successfully',
				data: result,
			};
		} catch (error) {
			this.logger.error(
				'Failed to process onboarding braindump',
				error,
			);
			throw error;
		}
	}

	/**
	 * Extract profile (goals, clients, values) from onboarding Q&A
	 */
	@Post('extract-profile')
	@ApiOperation({
		summary: 'Extract goals, clients, and values from onboarding Q&A',
	})
	@ApiBody({ type: ExtractProfileInputDto })
	async extractProfile(
		@Body() input: ExtractProfileInputDto,
		@CurrentUser() user?: any,
	): Promise<{
		success: boolean;
		message: string;
		data: ExtractProfileOutputDto;
	}> {
		try {
			if (!user || !user.id) {
				throw new BadRequestException(
					'User authentication required',
				);
			}

			this.logger.log(
				`Extracting profile for user ${user.id}`,
			);

			const result =
				await this.onboardingService.extractProfile(
					user.id,
					input.questions,
					input.query,
					input.client,
					input.values,
				);

			return {
				success: true,
				message: 'Profile extracted and saved successfully',
				data: result,
			};
		} catch (error) {
			this.logger.error(
				'Failed to extract profile',
				error,
			);
			throw error;
		}
	}
}
