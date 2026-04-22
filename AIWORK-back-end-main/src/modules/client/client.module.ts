import { Module } from '@nestjs/common';
import { ClientController } from './controllers/client.controller';
import { ClientService } from './services/client.service';
import { ScoringModule } from '@modules/scoring/scoring.module';

@Module({
	imports: [ScoringModule],
	controllers: [ClientController],
	providers: [ClientService],
	exports: [ClientService],
})
export class ClientModule {}
