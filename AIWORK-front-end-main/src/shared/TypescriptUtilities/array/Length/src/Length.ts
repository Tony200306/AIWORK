/**
 * Determines the number of elements in a tuple type.
 *
 * @template T - The tuple type whose length is to be determined.
 * @param {T} list - The source tuple type.
 * @returns {number} - The number of elements in the tuple.
 *
 * @example
 * ```typescript
 * type Case1 = Length<[1, 2, 3]>; // Result: 3
 * type Case2 = Length<['a', 'b', 'c', 'd']>; // Result: 4
 * type Case3 = Length<[]>; // Result: 0
 * ```
 */
export type Length<T extends any[]> = T['length'];
