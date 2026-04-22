/**
 * Detects if browser supports passive event listeners
 */
let supportsPassive = false;

try {
  const opts = Object.defineProperty({}, 'passive', {
    get() {
      supportsPassive = true;
    },
  });
  window.addEventListener(
    'testPassive',
    () => {
      return undefined;
    },
    opts,
  );
  window.removeEventListener(
    'testPassive',
    () => {
      return undefined;
    },
    opts,
  );
} catch (e) {
  // Ignore
}

/**
 * Get passive option if supported
 */
export const getPassiveArg = (): AddEventListenerOptions | undefined => {
  return supportsPassive ? { passive: true } : undefined;
};

/**
 * Get NON-passive option for preventDefault
 */
export const getNonPassiveArg = (): AddEventListenerOptions | undefined => {
  return supportsPassive ? { passive: false } : undefined;
};
