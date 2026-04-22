import { BrainDumpStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray } from 'class-validator';

/**
 * Message sent to FILE_INGEST queue for external AI processing
 */
export interface IFileIngestMessage {
	jobId: string; // BrainDump ID
	assetId: string; // Asset ID
	status: BrainDumpStatus;
	presignedDownloadUrl: string;
	presignedUploadUrl?: string;
	metadata: {
		userId: string;
		brainDumpId: string;
		fileName: string;
		mimeType: string;
	};
}

/**
 * Message received from FILE_EVENT queue after external processing
 */
export interface IFileEventMessage {
	jobId: string; // BrainDump ID
	assetId: string; // Asset ID
	status: BrainDumpStatus;
	timestamp: string;
	error?: string;
	result?: {
		processedPath?: string;
		extractedText?: string;
		embeddings?: any;
	};
}

/**
 * Job status stored in Redis for fast polling
 */
export interface IJobStatus {
	jobId: string;
	status: BrainDumpStatus | string;
	timestamp: string;
	assetCount?: number;
	completedCount?: number;
	error?: string | null;
}

/**
 * Per-asset status stored in Redis for tracking individual file processing
 */
export interface IAssetStatus {
	assetId: string;
	jobId: string;
	status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
	timestamp: string;
	error?: string;
	result?: {
		processedPath?: string;
		extractedText?: string;
	};
}

/**
 * Message sent to TASK_PRIORITY queue for async priority calculation
 */
export interface ITaskPriorityMessage {
	userId: string | null;
	taskIds: string[];
	metadata?: {
		braindumpId?: string;
		source?: string;
	};
}


export class ScopeFullDto {
	@ApiProperty({ description: 'Main objective' })
	@IsString()
	objective: string;

	@ApiProperty({ description: 'Why this is needed now', type: [String] })
	@IsArray()
	why_now: string[];

	@ApiProperty({ description: 'Definition of done criteria', type: [String] })
	@IsArray()
	definition_of_done: string[];

	@ApiProperty({ description: 'Constraints to consider', type: [String] })
	@IsArray()
	constraints: string[];

	@ApiProperty({ description: 'Items explicitly out of scope', type: [String] })
	@IsArray()
	out_of_scope: string[];

	@ApiProperty({ description: 'Risks if this is ignored', type: [String] })
	@IsArray()
	risk_if_ignored: string[];
}