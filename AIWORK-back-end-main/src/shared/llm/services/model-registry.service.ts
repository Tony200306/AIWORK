import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { aiConfig } from '@config/ai.config';
import {
	ModelConfig,
	ModelGroupConfig,
} from '../interfaces/model-config.interface';

@Injectable()
export class ModelRegistryService implements OnModuleInit {
	private readonly logger = new Logger(ModelRegistryService.name);
	private models = new Map<string, BaseChatModel>();

	onModuleInit() {
		this.loadModels();
	}

	private loadModels() {
		const configPath = aiConfig.llm.modelConfigPath;
		if (!fs.existsSync(configPath)) {
			this.logger.warn(`Model config not found at ${configPath}, skipping`);
			return;
		}

		const raw = fs.readFileSync(configPath, 'utf-8');
		const config = yaml.load(raw) as ModelConfig;

		for (const [groupName, group] of Object.entries(config.models)) {
			const model = this.buildModelWithFallbacks(groupName, group);
			this.models.set(groupName, model);
			this.logger.log(
				`Registered model group "${groupName}" → ${group.primary.model}`,
			);
		}
	}

	private buildModelWithFallbacks(
		groupName: string,
		group: ModelGroupConfig,
	): BaseChatModel {
		const primary = this.createChatModel(group.primary.model, {
			temperature: group.primary.temperature,
			maxTokens: group.primary.max_tokens,
		});

		if (!group.fallback?.length) {
			return primary;
		}

		const fallbacks = group.fallback.map((fb) =>
			this.createChatModel(fb.model, {
				temperature: fb.temperature,
				maxTokens: fb.max_tokens,
			}),
		);

		return primary.withFallbacks({
			fallbacks,
		}) as unknown as BaseChatModel;
	}

	private createChatModel(
		model: string,
		opts: { temperature?: number; maxTokens?: number },
	): ChatOpenAI {
		return new ChatOpenAI({
			model,
			temperature: opts.temperature ?? 0.2,
			maxTokens: opts.maxTokens,
			openAIApiKey: aiConfig.llm.apiKey,
			configuration: {
				baseURL: aiConfig.llm.baseUrl,
			},
		});
	}

	getModel(groupName: string): BaseChatModel {
		const model = this.models.get(groupName);
		if (!model) {
			throw new Error(`Model group "${groupName}" not registered`);
		}
		return model;
	}
}
