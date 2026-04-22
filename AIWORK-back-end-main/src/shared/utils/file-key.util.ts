import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique file key for storage
 *
 * @param originalName - Original filename with extension
 * @param prefix - Storage path prefix (default: 'uploads')
 * @returns Unique file key in format: prefix/timestamp-uuid-filename.ext
 *
 * @example
 * generateFileKey('document.pdf', 'braindump/user123')
 * // Returns: 'braindump/user123/1703520000000-a1b2c3d4-document.pdf'
 */
export function generateFileKey(originalName: string, prefix: string = 'uploads'): string {
	const ext = path.extname(originalName);
	const name = path.basename(originalName, ext);
	const timestamp = Date.now();
	const uuid = uuidv4().substring(0, 8);
	return `${prefix}/${timestamp}-${uuid}-${name}${ext}`;
}

/**
 * Extract original filename from a file key
 *
 * @param fileKey - The storage file key
 * @returns Original filename or the full key if pattern doesn't match
 */
export function extractFilenameFromKey(fileKey: string): string {
	const filename = path.basename(fileKey);
	// Match pattern: timestamp-uuid-originalname.ext
	const match = filename.match(/^\d+-[a-f0-9]+-(.+)$/);
	return match ? match[1] : filename;
}
