import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { CallbackHandler } from 'langfuse-langchain';
import { aiConfig } from '@config/ai.config';
import { ModelRegistryService } from './model-registry.service';

export interface LlmInvokeParams<T> {
	modelGroup: string;
	schema: z.ZodType<T>;
	userPrompt: string;
	systemPrompt?: string;
	traceName?: string;
}

@Injectable()
export class LlmService {
	private readonly logger = new Logger(LlmService.name);

	constructor(private readonly modelRegistry: ModelRegistryService) {}

	async invoke<T>(params: LlmInvokeParams<T>): Promise<T> {
		const { modelGroup, schema, userPrompt, systemPrompt, traceName } =
			params;

		const model = this.modelRegistry.getModel(modelGroup);
		const structuredModel = model.withStructuredOutput(schema as any);

		const messages: (SystemMessage | HumanMessage)[] = [];
		if (systemPrompt) {
			messages.push(new SystemMessage(systemPrompt));
		}
		messages.push(new HumanMessage(userPrompt));

		const callbacks: any[] = [];
		if (aiConfig.langfuse.enabled) {
			try {
				const handler = new CallbackHandler({
					publicKey: aiConfig.langfuse.publicKey,
					secretKey: aiConfig.langfuse.secretKey,
					baseUrl: aiConfig.langfuse.host,
					metadata: {
						traceName: traceName ?? `llm.${modelGroup}`,
					},
					tags: [modelGroup],
				});
				callbacks.push(handler);
			} catch (err) {
				this.logger.warn(`Langfuse callback init failed: ${err.message}`);
			}
		}

		const result = await structuredModel.invoke(messages, {
			callbacks: callbacks.length > 0 ? callbacks : undefined,
		});

		return result as T;
	}
}
