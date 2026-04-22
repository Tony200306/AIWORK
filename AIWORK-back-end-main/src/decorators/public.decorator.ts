import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to mark routes as public (no authentication required)
 *
 * @example
 * @Public()
 * @Get('/public-data')
 * async getPublicData() {
 *   return { message: 'This is public' };
 * }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
