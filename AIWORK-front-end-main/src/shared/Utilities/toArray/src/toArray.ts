/**
 * Converts the input into an array.
 * If the input is already an array, it is returned as is. If the input is a single element, it is wrapped into an array.
 * This function ensures consistent array handling for inputs that might be either an individual item or an array of items.
 *
 * @template T The type of the elements.
 * @param {T | T[]} items The input item or array of items to be converted into an array.
 * @returns {T[]} An array of items. Returns the original array if the input is an array, or a new array with the single item if the input is not an array.
 *
 * @example
 * // Usage examples
 * const singleItem = 'hello';
 * const arrayOfItems = ['hello', 'world'];
 *
 * const array1 = toArray(singleItem); // ['hello']
 * const array2 = toArray(arrayOfItems); // ['hello', 'world']
 */
export const toArray = <T>(items: T | T[]): T[] => {
  return Array.isArray(items) ? items : [items];
};
