import { ApiProperty } from '@nestjs/swagger';

/**
 * Standard API response DTO
 */
export class StandardResponseDto<T> {
	@ApiProperty({ description: 'Whether the request was successful' })
	success: boolean;

	@ApiProperty({ description: 'Response message' })
	message: string;

	@ApiProperty({ description: 'Response data' })
	data: T;

	@ApiProperty({ description: 'HTTP status code' })
	statusCode: number;
}

/**
 * Pagination metadata DTO
 */
export class PaginationMetaDto {
	@ApiProperty({ description: 'Total number of items' })
	total: number;

	@ApiProperty({ description: 'Current page number (1-indexed)' })
	page: number;

	@ApiProperty({ description: 'Items per page' })
	limit: number;
}

/**
 * Paginated API response DTO
 */
export class PaginatedResponseDto<T> extends StandardResponseDto<T[]> {
	@ApiProperty({ type: PaginationMetaDto, description: 'Pagination metadata' })
	pagination: PaginationMetaDto;
}

/**
 * Error response DTO
 */
export class ErrorResponseDto {
	@ApiProperty({ description: 'Whether the request was successful', example: false })
	success: boolean;

	@ApiProperty({ description: 'Error message' })
	message: string;

	@ApiProperty({ description: 'Response data (null for errors)', example: null })
	data: null;

	@ApiProperty({ description: 'HTTP status code' })
	statusCode: number;
}
