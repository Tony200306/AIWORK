import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to get current authenticated user from request
 *
 * @example
 * @Get('/profile')
 * async getProfile(@CurrentUser() user) {
 *   return user;
 * }
 *
 * @example - Get specific property
 * @Get('/me')
 * async getMe(@CurrentUser('email') email: string) {
 *   return { email };
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
