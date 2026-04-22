import { Module } from '@nestjs/common';
import { OnboardingController } from './controllers/onboarding.controller';
import { OnboardingService } from './services/onboarding.service';
import { GoalModule } from '@modules/goal/goal.module';
import { ClientModule } from '@modules/client/client.module';
import { UserModule } from '@modules/user/user.module';

@Module({
	imports: [GoalModule, ClientModule, UserModule],
	controllers: [OnboardingController],
	providers: [OnboardingService],
	exports: [OnboardingService],
})
export class OnboardingModule {}
