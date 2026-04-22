import { HttpException } from '@nestjs/common';

import { ErrorCode, ERROR_CONFIG } from './error-codes';

/**
 * Standard error class for consistent error handling
 *
 * @example
 * throw new StandardError(ErrorCode.USER_NOT_FOUND, 'User with ID 123 not found');
 */
export class StandardError extends HttpException {
  constructor(
    public readonly errorCode: ErrorCode,
    description?: string,
  ) {
    const config = ERROR_CONFIG[errorCode];
    const message = description || config.message;

    super(
      {
        message,
        errorCode,
        statusCode: config.statusCode,
        description,
        timestamp: new Date().toISOString(),
      },
      config.statusCode,
    );
  }
}

/**
 * Helper function to throw standard errors
 *
 * @example
 * throwStandardError(ErrorCode.USER_NOT_FOUND, 'User with ID 123 not found');
 */
export function throwStandardError(
  errorCode: ErrorCode,
  description?: string,
): never {
  throw new StandardError(errorCode, description);
}
