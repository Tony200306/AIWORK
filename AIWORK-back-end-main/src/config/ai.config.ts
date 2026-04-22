import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface AiConfig {
	/** Python vantum-ai backend (braindump, priority, goals) */
	vantumAi: {
		baseUrl: string;
		apiKey: string;
		timeout: number;
		enabled: boolean;
	};
	/** LLM provider (OpenRouter / OpenAI-compatible) */
	llm: {
		apiKey: string;
		baseUrl: string;
		modelConfigPath: string;
		promptsDir: string;
	};
	/** Langfuse observability */
	langfuse: {
		enabled: boolean;
		publicKey: string;
		secretKey: string;
		host: string;
	};
}

export const aiConfig: AiConfig = {
	vantumAi: {
		baseUrl:
			process.env.AI_SERVICE_URL ||
			process.env.AI_PRIORITY_SERVICE_URL ||
			process.env.ONBOARDING_API_URL ||
			'http://localhost:8048',
		apiKey:
			process.env.AI_SERVICE_API_KEY ||
			process.env.AI_PRIORITY_API_KEY ||
			process.env.ONBOARDING_API_KEY ||
			'vantumapikey',
		timeout: parseInt(
			process.env.AI_SERVICE_TIMEOUT ||
				process.env.AI_PRIORITY_TIMEOUT ||
				'30000',
			10,
		),
		enabled:
			(process.env.AI_SERVICE_ENABLED ??
				process.env.AI_PRIORITY_ENABLED) === 'true',
	},
	llm: {
		apiKey:
			process.env.OPENAI_API_KEY ||
			process.env.OPENROUTER_API_KEY ||
			'',
		baseUrl:
			process.env.OPENAI_BASE_URL ||
			process.env.OPENROUTER_BASE_URL ||
			'https://openrouter.ai/api/v1',
		modelConfigPath:
			process.env.MODEL_CONFIG_PATH ||
			path.resolve(process.cwd(), 'configs/model_config.yaml'),
		promptsDir:
			process.env.PROMPTS_DIR ||
			path.resolve(process.cwd(), 'configs/prompts'),
	},
	langfuse: {
		enabled: process.env.LANGFUSE_ENABLED === 'true',
		publicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
		secretKey: process.env.LANGFUSE_SECRET_KEY || '',
		host: process.env.LANGFUSE_HOST || 'https://cloud.langfuse.com',
	},
};
