import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { CurrentUser } from '@decorators/current-user.decorator';
import { FeedbackService } from '../services/feedback.service';
import { CreateFeedbackDto } from '../dtos';

@ApiTags('Feedback')
@ApiBearerAuth('JWT-auth')
@Controller('feedbacks')
export class FeedbackController {
  private readonly logger = new Logger(FeedbackController.name);

  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @ApiOperation({ summary: 'Submit sprint feedback' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateFeedbackDto,
  ) {
    const feedback = await this.feedbackService.create(userId, dto);
    return {
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all feedbacks for the current user' })
  async findAll(@CurrentUser('id') userId: string) {
    const feedbacks = await this.feedbackService.findAllByUser(userId);
    return {
      success: true,
      message: 'OK',
      data: feedbacks,
    };
  }

  @Get('sprint/:sprintId')
  @ApiOperation({ summary: 'Get feedback for a specific sprint' })
  @ApiParam({ name: 'sprintId', description: 'Sprint ID' })
  async findBySprint(
    @CurrentUser('id') userId: string,
    @Param('sprintId') sprintId: string,
  ) {
    const feedback = await this.feedbackService.findBySprint(userId, sprintId);
    return {
      success: true,
      message: 'OK',
      data: feedback,
    };
  }
}
