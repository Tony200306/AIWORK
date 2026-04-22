import { ErrorCode, throwStandardError } from './index';

/**
 * Storage-specific exception helper
 * Provides static methods to throw standardized errors
 */
export class StorageException {
	/**
	 * Throw when file upload fails
	 */
	static UploadFailed(reason?: string): never {
		throwStandardError(
			ErrorCode.STORAGE_UPLOAD_FAILED,
			reason ? `Upload failed: ${reason}` : undefined,
		);
	}

	/**
	 * Throw when file download fails
	 */
	static DownloadFailed(reason?: string): never {
		throwStandardError(
			ErrorCode.STORAGE_DOWNLOAD_FAILED,
			reason ? `Download failed: ${reason}` : undefined,
		);
	}

	/**
	 * Throw when file is not found
	 */
	static FileNotFound(key?: string): never {
		throwStandardError(
			ErrorCode.STORAGE_FILE_NOT_FOUND,
			key ? `File not found: ${key}` : undefined,
		);
	}

	/**
	 * Throw when no file is provided
	 */
	static NoFileProvided(): never {
		throwStandardError(ErrorCode.STORAGE_NO_FILE_PROVIDED);
	}
}
