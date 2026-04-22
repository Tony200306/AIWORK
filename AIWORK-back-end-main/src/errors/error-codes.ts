import { HttpStatus } from '@nestjs/common';

/**
 * Error codes for the application
 * Format: ERR_XXXX where XXXX is a unique identifier
 */
export enum ErrorCode {
  // General errors (0000-0999)
  UNKNOWN_ERROR = 'ERR_0000',
  VALIDATION_FAILED = 'ERR_0001',
  RESOURCE_NOT_FOUND = 'ERR_0002',
  UNAUTHORIZED_ACCESS = 'ERR_0003',
  FORBIDDEN_ACCESS = 'ERR_0004',

  // User errors (1000-1999)
  USER_NOT_FOUND = 'ERR_1000',
  USER_ALREADY_EXISTS = 'ERR_1001',
  INCORRECT_PASSWORD = 'ERR_1002',
  USER_NOT_AUTHORIZED = 'ERR_1003',

  // Database errors (2000-2999)
  DATABASE_ERROR = 'ERR_2000',
  DUPLICATE_ENTRY = 'ERR_2001',

  // RabbitMQ errors (3000-3999)
  RABBITMQ_CONNECTION_ERROR = 'ERR_3000',
  MESSAGE_PUBLISH_FAILED = 'ERR_3001',

  // Redis errors (4000-4999)
  REDIS_CONNECTION_ERROR = 'ERR_4000',
  CACHE_SET_FAILED = 'ERR_4001',

  // BrainDump errors (5000-5999)
  BRAINDUMP_NOT_FOUND = 'ERR_5000',
  BRAINDUMP_UNAUTHORIZED = 'ERR_5001',
  BRAINDUMP_NO_FILE = 'ERR_5002',
  BRAINDUMP_PROCESSING_FAILED = 'ERR_5003',

  // Storage errors (6000-6999)
  STORAGE_UPLOAD_FAILED = 'ERR_6000',
  STORAGE_DOWNLOAD_FAILED = 'ERR_6001',
  STORAGE_FILE_NOT_FOUND = 'ERR_6002',
  STORAGE_NO_FILE_PROVIDED = 'ERR_6003',
}

/**
 * Error configuration mapping error codes to HTTP status codes
 */
export const ERROR_CONFIG: Record<ErrorCode, { statusCode: HttpStatus; message: string }> = {
  [ErrorCode.UNKNOWN_ERROR]: {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'An unknown error occurred',
  },
  [ErrorCode.VALIDATION_FAILED]: {
    statusCode: HttpStatus.BAD_REQUEST,
    message: 'Validation failed',
  },
  [ErrorCode.RESOURCE_NOT_FOUND]: {
    statusCode: HttpStatus.NOT_FOUND,
    message: 'Resource not found',
  },
  [ErrorCode.UNAUTHORIZED_ACCESS]: {
    statusCode: HttpStatus.UNAUTHORIZED,
    message: 'Unauthorized access',
  },
  [ErrorCode.FORBIDDEN_ACCESS]: {
    statusCode: HttpStatus.FORBIDDEN,
    message: 'Forbidden access',
  },
  [ErrorCode.USER_NOT_FOUND]: {
    statusCode: HttpStatus.NOT_FOUND,
    message: 'User not found',
  },
  [ErrorCode.USER_ALREADY_EXISTS]: {
    statusCode: HttpStatus.CONFLICT,
    message: 'User already exists',
  },
  [ErrorCode.INCORRECT_PASSWORD]: {
    statusCode: HttpStatus.UNAUTHORIZED,
    message: 'Incorrect password',
  },
  [ErrorCode.USER_NOT_AUTHORIZED]: {
    statusCode: HttpStatus.FORBIDDEN,
    message: 'User not authorized',
  },
  [ErrorCode.DATABASE_ERROR]: {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'Database error occurred',
  },
  [ErrorCode.DUPLICATE_ENTRY]: {
    statusCode: HttpStatus.CONFLICT,
    message: 'Duplicate entry',
  },
  [ErrorCode.RABBITMQ_CONNECTION_ERROR]: {
    statusCode: HttpStatus.SERVICE_UNAVAILABLE,
    message: 'RabbitMQ connection error',
  },
  [ErrorCode.MESSAGE_PUBLISH_FAILED]: {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'Failed to publish message',
  },
  [ErrorCode.REDIS_CONNECTION_ERROR]: {
    statusCode: HttpStatus.SERVICE_UNAVAILABLE,
    message: 'Redis connection error',
  },
  [ErrorCode.CACHE_SET_FAILED]: {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'Failed to set cache',
  },
  [ErrorCode.BRAINDUMP_NOT_FOUND]: {
    statusCode: HttpStatus.NOT_FOUND,
    message: 'Brain dump not found',
  },
  [ErrorCode.BRAINDUMP_UNAUTHORIZED]: {
    statusCode: HttpStatus.FORBIDDEN,
    message: 'Unauthorized to access this brain dump',
  },
  [ErrorCode.BRAINDUMP_NO_FILE]: {
    statusCode: HttpStatus.BAD_REQUEST,
    message: 'No file provided',
  },
  [ErrorCode.BRAINDUMP_PROCESSING_FAILED]: {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'Brain dump processing failed',
  },
  [ErrorCode.STORAGE_UPLOAD_FAILED]: {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'File upload failed',
  },
  [ErrorCode.STORAGE_DOWNLOAD_FAILED]: {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'File download failed',
  },
  [ErrorCode.STORAGE_FILE_NOT_FOUND]: {
    statusCode: HttpStatus.NOT_FOUND,
    message: 'File not found',
  },
  [ErrorCode.STORAGE_NO_FILE_PROVIDED]: {
    statusCode: HttpStatus.BAD_REQUEST,
    message: 'No file provided',
  },
};

/**
 * Standard error response shape
 */
export interface IStandardErrorResponse {
  message: string;
  errorCode: ErrorCode;
  statusCode: HttpStatus;
  description?: string;
  timestamp: string;
  path?: string;
}
