/**
 * Delays the execution of subsequent code for a specified number of milliseconds.
 *
 * @param {number} [ms=0] - The number of milliseconds to delay execution. Defaults to 0 if not specified.
 * @returns {Promise<void>} A Promise that resolves after the specified delay.
 */
export const delay = (ms = 0): Promise<void> => {
  return new Promise<void>(resolve => {
    const timeId = setTimeout(() => {
      resolve(undefined);
      clearTimeout(timeId);
    }, ms);
  });
};
