import { Module } from '@nestjs/common';
import { AiPriorityService } from '@shared/services/ai-priority.service';
import { StorageModule } from '@shared/storage/storage.module';
import { BrainDumpController } from './controllers/braindump.controller';
import { ExtBrainDumpController } from './controllers/ext-braindump.controller';
import { BrainDumpService } from './services/braindump.service';
import { ExtBrainDumpService } from './services/ext-braindump.service';
import { FileEventConsumer } from './services/file-event.consumer';
import { TaskPriorityService } from './services/task-priority.service';
import { TaskPriorityConsumer } from './services/task-priority.consumer';

@Module({
	imports: [StorageModule],
	controllers: [BrainDumpController, ExtBrainDumpController],
	providers: [
		BrainDumpService,
		ExtBrainDumpService,
		FileEventConsumer,
		TaskPriorityConsumer,
		AiPriorityService,
		TaskPriorityService,
	],
	exports: [BrainDumpService, ExtBrainDumpService, TaskPriorityService],
})
export class BrainDumpModule { }
