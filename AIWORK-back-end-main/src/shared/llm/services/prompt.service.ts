import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as nunjucks from 'nunjucks';
import { Langfuse } from 'langfuse';
import { aiConfig } from '@config/ai.config';

@Injectable()
export class PromptService implements OnModuleInit {
	private readonly logger = new Logger(PromptService.name);
	private localPrompts = new Map<string, string>();
	private langfuse: Langfuse | null = null;

	onModuleInit() {
		this.loadLocalPrompts();
		this.initLangfuse();
	}

	private initLangfuse() {
		if (!aiConfig.langfuse.enabled) return;

		try {
			this.langfuse = new Langfuse({
				publicKey: aiConfig.langfuse.publicKey,
				secretKey: aiConfig.langfuse.secretKey,
				baseUrl: aiConfig.langfuse.host,
			});
			this.logger.log('Langfuse client initialized');
		} catch (err) {
			this.logger.warn(`Failed to init Langfuse: ${err.message}`);
		}
	}

	private loadLocalPrompts() {
		const promptsDir = aiConfig.llm.promptsDir;
		if (!fs.existsSync(promptsDir)) {
			this.logger.warn(`Prompts dir not found at ${promptsDir}, skipping`);
			return;
		}

		this.walkDir(promptsDir, promptsDir);
		this.logger.log(
			`Loaded ${this.localPrompts.size} local prompt templates`,
		);
	}

	private walkDir(dir: string, baseDir: string) {
		const entries = fs.readdirSync(dir, { withFileTypes: true });
		for (const entry of entries) {
			const fullPath = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				this.walkDir(fullPath, baseDir);
			} else if (entry.name.endsWith('.md')) {
				const relativePath = path.relative(baseDir, fullPath);
				// scoring/evaluator/system_prompt.md → scoring.evaluator.system_prompt
				const promptName = relativePath
					.replace(/\.md$/, '')
					.replace(/[\\/]/g, '.');
				const content = fs.readFileSync(fullPath, 'utf-8');
				this.localPrompts.set(promptName, content);
			}
		}
	}

	async getPrompt(
		name: string,
		variables?: Record<string, any>,
		useLocalOnly = false,
	): Promise<string> {
		let template: string | null = null;

		// Try Langfuse first (unless local-only)
		if (!useLocalOnly && this.langfuse) {
			try {
				const langfusePrompt = await this.langfuse.getPrompt(name);
				template = langfusePrompt.prompt;
			} catch {
				// Fallback to local
			}
		}

		// Fallback to local
		if (!template) {
			template = this.localPrompts.get(name) ?? null;
		}

		if (!template) {
			throw new Error(`Prompt "${name}" not found`);
		}

		// Merge variables with auto-injected values
		const vars = {
			current_date: new Date().toISOString().split('T')[0],
			...variables,
		};

		return nunjucks.renderString(template, vars);
	}
}
