import { Module } from '@nestjs/common';
import { OnboardingQuestionController } from './controllers/onboarding-question.controller';
import { OnboardingQuestionService } from './services/onboarding-question.service';


@Module({
    controllers: [OnboardingQuestionController],
    providers: [OnboardingQuestionService],
    exports: [OnboardingQuestionService],
})
export class OnboardingQuestionModule { }