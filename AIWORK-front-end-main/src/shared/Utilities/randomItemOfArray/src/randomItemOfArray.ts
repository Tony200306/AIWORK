/**
 * Returns a random item from the given array.
 *
 * @param {Array<T>} array - The array from which to select a random item.
 * @returns {T} A random item from the array.
 *
 * @template T
 */
export const randomItemOfArray = <T>(array: T[]): T => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};
