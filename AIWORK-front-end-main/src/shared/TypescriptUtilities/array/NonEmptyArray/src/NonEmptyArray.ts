/**
 * Ensures that a given array type always contains at least one element.
 *
 * @template T - The type of the elements in the array.
 * @param {T[]} itemType - The type of the array elements.
 * @returns {NonEmptyArrayType} - The array type with at least one element.
 *
 * @example
 * ```typescript
 * const case1: NonEmptyArray<number> = [1, 2]; // Valid
 * const case2: NonEmptyArray<number> = [1];    // Valid
 * const case3: NonEmptyArray<number> = [];     // Type error: Array must contain at least one element
 * ```
 */
export type NonEmptyArray<T> = [T, ...T[]];
