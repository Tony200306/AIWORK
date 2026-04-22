import { ErrorCode, throwStandardError } from './index';

/**
 * BrainDump-specific exception helper
 * Provides static methods to throw standardized errors
 */
export class BrainDumpException {
	/**
	 * Throw when brain dump is not found
	 */
	static NotFound(id?: string): never {
		throwStandardError(
			ErrorCode.BRAINDUMP_NOT_FOUND,
			id ? `Brain dump with ID ${id} not found` : undefined,
		);
	}

	/**
	 * Throw when user is not authorized to access brain dump
	 */
	static Unauthorized(): never {
		throwStandardError(ErrorCode.BRAINDUMP_UNAUTHORIZED);
	}

	/**
	 * Throw when no file is provided for brain dump
	 */
	static NoFileProvided(): never {
		throwStandardError(ErrorCode.BRAINDUMP_NO_FILE);
	}

	/**
	 * Throw when brain dump processing fails
	 */
	static ProcessingFailed(reason?: string): never {
		throwStandardError(
			ErrorCode.BRAINDUMP_PROCESSING_FAILED,
			reason ? `Processing failed: ${reason}` : undefined,
		);
	}
}
