import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
	HttpStatus,
	Logger,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Global Exception Filter
 * Catches all exceptions and formats them into a consistent response structure
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(GlobalExceptionFilter.name);

	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest();

		let status = HttpStatus.INTERNAL_SERVER_ERROR;
		let message = 'Internal server error';

		if (exception instanceof HttpException) {
			status = exception.getStatus();
			const exceptionResponse = exception.getResponse();

			if (typeof exceptionResponse === 'string') {
				message = exceptionResponse;
			} else if (typeof exceptionResponse === 'object') {
				const responseObj = exceptionResponse as Record<string, any>;
				// Handle validation errors (array of messages)
				if (Array.isArray(responseObj.message)) {
					message = responseObj.message.join(', ');
				} else {
					message = responseObj.message || message;
				}
			}
		} else if (exception instanceof Error) {
			message = exception.message;
		}

		// Log the error with context
		this.logger.error(
			`${request.method} ${request.url} - ${status} - ${message}`,
			exception instanceof Error ? exception.stack : '',
		);

		response.status(status).json({
			success: false,
			message,
			data: null,
			statusCode: status,
		});
	}
}
