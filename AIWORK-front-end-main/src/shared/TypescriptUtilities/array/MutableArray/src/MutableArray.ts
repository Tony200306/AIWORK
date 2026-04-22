/**
 * Converts a read-only array type (`readonly T[]`) to a mutable array type.
 *
 * @template T - The type of the read-only array to be converted.
 * @param {T} list - The source read-only array type.
 * @returns {MutableArrayType} - The mutable version of the input array type.
 *
 * @example
 * ```typescript
 * type Case1 = MutableArray<readonly [1, 2, 3, 4]>; // Result: [1, 2, 3, 4]
 * type Case2 = MutableArray<readonly ['a', 'b', 'c']>; // Result: ['a', 'b', 'c']
 * type Case3 = MutableArray<readonly []>; // Result: []
 * ```
 */
export type MutableArray<T> = {
  -readonly [K in keyof T]: T[K];
};
