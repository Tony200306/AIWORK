import { Global, Module } from '@nestjs/common';
import { ModelRegistryService } from './services/model-registry.service';
import { PromptService } from './services/prompt.service';
import { LlmService } from './services/llm.service';

@Global()
@Module({
	providers: [ModelRegistryService, PromptService, LlmService],
	exports: [ModelRegistryService, PromptService, LlmService],
})
export class LlmModule {}
