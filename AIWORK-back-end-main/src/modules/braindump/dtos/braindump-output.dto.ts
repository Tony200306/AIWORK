/**
 * DTO for tag data in braindump output (snake_case from AI service)
 */
export class BrainDumpOutputTagDto {
	name: string;

	contribution_weight?: number;
}

/**
 * DTO for step data in braindump output (snake_case from AI service)
 */
export class BrainDumpOutputStepDto {
	order_index: number;

	title: string;

	description?: string;

	sys_est_minutes: number;

	difficulty?: number;

	extra_prop?: Record<string, any>;
}

/**
 * DTO for task data in braindump output (snake_case from AI service)
 */
export class BrainDumpOutputTaskDto {
	title: string;

	description?: string;

	expected_time_hours?: number;

	due_at?: string | null;

	steps?: BrainDumpOutputStepDto[];

	tags?: BrainDumpOutputTagDto[];

	extra_prop?: Record<string, any>;
}

/**
 * Status enum for braindump output
 */
export enum BrainDumpOutputStatus {
	COMPLETED = 'COMPLETED',
	FAILED = 'FAILED',
	PARTIAL = 'PARTIAL',
}

/**
 * Main DTO for braindump output message from AI worker (snake_case)
 */
export class BrainDumpOutputMessageDto {
	braindump_id: string;

	status: BrainDumpOutputStatus;

	tasks?: BrainDumpOutputTaskDto[];

	error?: string;
}
