/**
 * Utility functions for managing auth token cookie
 * Ensures consistent cookie management across the app
 */

const AUTH_COOKIE_NAME = 'auth_token';
const COOKIE_MAX_AGE = 86400; // 24 hours in seconds

/**
 * Set auth token cookie
 * Always removes old cookie first to avoid conflicts
 */
export const setAuthCookie = (token: string): void => {
  if (typeof document === 'undefined') return;

  // Remove old cookie first
  removeAuthCookie();

  // Set new cookie
  const cookieString = `${AUTH_COOKIE_NAME}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  document.cookie = cookieString;

  console.log('[AuthCookie] Set auth cookie:', token.substring(0, 20) + '...');
};

/**
 * Remove auth token cookie
 */
export const removeAuthCookie = (): void => {
  if (typeof document === 'undefined') return;

  // Set cookie with max-age=0 to delete it
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;

  console.log('[AuthCookie] Removed auth cookie');
};

/**
 * Get auth token from cookie
 */
export const getAuthCookie = (): string | null => {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === AUTH_COOKIE_NAME) {
      return value;
    }
  }
  return null;
};
