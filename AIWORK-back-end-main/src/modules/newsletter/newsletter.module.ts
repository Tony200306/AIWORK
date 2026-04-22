import { Module } from '@nestjs/common';
import { NewsletterController } from './controllers/newsletter.controller';
import { BeehiivService } from './services/beehiiv.service';
import { NewsletterRepository } from './services/newsletter.repository';
import { PrismaService } from '@shared/database/prisma.service';

@Module({
	controllers: [NewsletterController],
	providers: [BeehiivService, NewsletterRepository, PrismaService],
	exports: [BeehiivService, NewsletterRepository],
})
export class NewsletterModule {}
