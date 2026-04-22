/**
 * Utility to manage pending braindump ID for unauthenticated users
 * When user creates braindump before login, we save the ID
 * After OAuth login, we link this braindump to their account
 */

const PENDING_BRAINDUMP_KEY = 'pending_braindump_id';

export const pendingBraindump = {
  /**
   * Save braindump ID to sessionStorage
   * Replaces any existing braindump ID
   */
  save: (braindumpId: string): void => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(PENDING_BRAINDUMP_KEY, braindumpId);
      console.log('[PendingBraindump] Saved braindump ID:', braindumpId);
    }
  },

  /**
   * Get pending braindump ID from sessionStorage
   * Returns null if not found
   */
  get: (): string | null => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(PENDING_BRAINDUMP_KEY);
    }
    return null;
  },

  /**
   * Clear pending braindump ID from sessionStorage
   * Call this after successfully linking braindump to user account
   */
  clear: (): void => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(PENDING_BRAINDUMP_KEY);
      console.log('[PendingBraindump] Cleared braindump ID');
    }
  },

  /**
   * Check if there's a pending braindump
   */
  hasPending: (): boolean => {
    return pendingBraindump.get() !== null;
  },
};
