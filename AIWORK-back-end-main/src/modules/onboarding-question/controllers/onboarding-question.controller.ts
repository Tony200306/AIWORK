import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { OnboardingQuestionService } from '../services/onboarding-question.service';
import { CreateQuestionCardDto } from '../dtos/onboarding-question.dto';
import { Public } from '@decorators/public.decorator';

@ApiTags('Onboarding Questions')
@Controller('onboarding-questions')
export class OnboardingQuestionController {
    constructor(private readonly service: OnboardingQuestionService) { }
    @Get()
    @ApiOperation({ summary: 'Get all question cards' })
    @ApiResponse({ status: 200, description: 'List of question cards' })
    findAll() {
        return this.service.findAll();
    }

    @Public()
    @Get(':slug')
    @ApiOperation({ summary: 'Get question card by slug' })
    @ApiResponse({ status: 200, description: 'Question card found' })
    @ApiResponse({ status: 404, description: 'Question card not found' })
    findBySlug(@Param('slug') slug: string) {
        return this.service.findBySlug(slug);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new question card' })
    @ApiBody({ type: CreateQuestionCardDto })
    @ApiResponse({ status: 201, description: 'Question card created' })
    create(@Body() dto: CreateQuestionCardDto) {
        return this.service.create(dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a question card' })
    @ApiResponse({ status: 200, description: 'Question card deleted' })
    delete(@Param('id', ParseUUIDPipe) id: string) {
        return this.service.delete(id);
    }
}