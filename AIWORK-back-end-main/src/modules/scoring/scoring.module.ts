import { Module } from '@nestjs/common';
import { ScoringController } from './controllers/scoring.controller';
import { CompositeScorerService } from './services/composite-scorer.service';
import { SuggestLinksService } from './services/suggest-links.service';

@Module({
	controllers: [ScoringController],
	providers: [CompositeScorerService, SuggestLinksService],
	exports: [CompositeScorerService, SuggestLinksService],
})
export class ScoringModule {}
