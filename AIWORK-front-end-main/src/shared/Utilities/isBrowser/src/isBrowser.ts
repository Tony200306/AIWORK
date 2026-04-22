/**
 * Determines if the current environment is a web browser.
 *
 * @returns {boolean} True if the current environment is a web browser; otherwise, false.
 */
export const isBrowser = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    typeof window.document !== 'undefined' &&
    typeof window.document.createElement !== 'undefined'
  );
};
