import { ErrorCode, throwStandardError } from 'src/errors';

/**
 * User-specific exception helper class
 * Uses standardized error codes for consistency
 */
export class UserException {
  static UserExist(): never {
    throwStandardError(ErrorCode.USER_ALREADY_EXISTS, 'User with this email already exists');
  }

  static UserNotFound(): never {
    throwStandardError(ErrorCode.USER_NOT_FOUND, 'User not found');
  }

  static UserNotAuthorized(): never {
    throwStandardError(ErrorCode.USER_NOT_AUTHORIZED, 'User not authorized to perform this action');
  }

  static NotCorrectPassword(): never {
    throwStandardError(ErrorCode.INCORRECT_PASSWORD, 'Incorrect password provided');
  }
}