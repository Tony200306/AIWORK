export interface ModelEntry {
	model: string;
	temperature?: number;
	max_tokens?: number;
}

export interface ModelGroupConfig {
	model_type: string;
	primary: ModelEntry;
	fallback?: ModelEntry[];
}

export interface ModelConfig {
	models: Record<string, ModelGroupConfig>;
}
