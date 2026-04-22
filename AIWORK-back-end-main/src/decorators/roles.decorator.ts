import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify required roles for route access
 *
 * @example
 * @Roles('admin', 'moderator')
 * @Get('/admin-only')
 * async adminOnly() {
 *   return { message: 'Admin access' };
 * }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
