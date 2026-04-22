import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Standard API response format
 */
export interface StandardResponse<T> {
	success: boolean;
	message: string;
	data: T;
	statusCode: number;
}

/**
 * Paginated API response format
 */
export interface PaginatedResponse<T> extends StandardResponse<T[]> {
	pagination: {
		total: number;
		page: number;
		limit: number;
	};
}

/**
 * Response Interceptor
 * Standardizes all API responses to a consistent format
 *
 * Handles:
 * - Already-formatted responses (with success field)
 * - Raw data (auto-wrapped)
 * - Paginated responses (with pages/pagination field)
 */
@Injectable()
export class ResponseInterceptor<T>
	implements NestInterceptor<T, StandardResponse<T>>
{
	intercept(
		context: ExecutionContext,
		next: CallHandler,
	): Observable<StandardResponse<T>> {
		const response = context.switchToHttp().getResponse();

		return next.handle().pipe(
			map((data) => {
				// Handle null/undefined
				if (data === null || data === undefined) {
					return {
						success: true,
						message: 'OK',
						data: null,
						statusCode: response.statusCode,
					};
				}

				// Handle already-formatted responses (with success field)
				if (data?.success !== undefined) {
					return {
						...data,
						statusCode: data.statusCode || response.statusCode,
					};
				}

				// Handle paginated responses (legacy format with pages)
				if (data?.pages !== undefined) {
					return {
						success: true,
						message: data.message || 'OK',
						data: data.data,
						statusCode: data.statusCode || response.statusCode,
						pagination: data.pages,
					};
				}

				// Auto-wrap raw data
				return {
					success: true,
					message: 'OK',
					data,
					statusCode: response.statusCode,
				};
			}),
		);
	}
}
