import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AuthModule } from '@modules/auth/auth.module';
import { UserModule } from '@modules/user/user.module';
import { StorageModule } from '@modules/storage/storage.module';
import { BrainDumpModule } from '@modules/braindump/braindump.module';
import { TaskModule } from '@modules/task/task.module';
import { TagModule } from '@modules/tag/tag.module';
import { SprintModule } from '@modules/sprint/sprint.module';
import { CalendarModule } from '@modules/calendar/calendar.module';
import { OnboardingModule } from '@modules/onboarding/onboarding.module';
import { NewsletterModule } from '@modules/newsletter/newsletter.module';
import { FeedbackModule } from '@modules/feedback/feedback.module';
import { GoalModule } from '@modules/goal/goal.module';
import { ClientModule } from '@modules/client/client.module';
import { ScoringModule } from '@modules/scoring/scoring.module';

import { DatabaseModule } from '@shared/database/database.module';
import { RedisModule } from '@shared/cache/redis/redis.module';
import { RabbitMQModule } from '@shared/messaging/rabbitmq/rabbitmq.module';
import { LlmModule } from '@shared/llm/llm.module';

import { JwtAuthGuard } from '@guards/jwt-auth.guard';
import { RolesGuard } from '@guards/roles.guard';
import { OnboardingQuestionModule } from '@modules/onboarding-question/onboarding-question.module';

/**
 * Root application module
 * Imports all feature modules and global modules
 */
@Module({
	imports: [
		// Global modules
		DatabaseModule,
		RabbitMQModule,
		RedisModule,
		LlmModule,

		// Feature modules
		AuthModule,
		UserModule,
		StorageModule,
		BrainDumpModule,
		TaskModule,
		TagModule,
		SprintModule,
		OnboardingQuestionModule,
		CalendarModule,
		OnboardingModule,
		NewsletterModule,
		FeedbackModule,
		GoalModule,
		ClientModule,
		ScoringModule,
	],
	providers: [
		// Global JWT authentication guard
		// All routes require authentication by default
		// Use @Public() decorator to make routes public
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard,
		},
		// Global roles guard for role-based authorization
		// Use @Roles('admin', 'user') decorator to protect routes
		{
			provide: APP_GUARD,
			useClass: RolesGuard,
		},
	],
})
export class AppModule {}
