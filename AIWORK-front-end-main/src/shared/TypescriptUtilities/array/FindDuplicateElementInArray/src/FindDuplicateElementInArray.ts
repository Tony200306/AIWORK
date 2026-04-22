import { CheckElementExistInArray } from '../../CheckElementExistInArray';

/**
 * Identifies and retrieves duplicate items within an array type.
 *
 * @template T - The type of the source array.
 * @param {T} list - The source array type.
 * @returns {DuplicateResult} - An array containing a message and the duplicated items.
 *
 * @example
 * ```typescript
 * const data = [[1, 2], [1, 2], 2, 3, 4] as const;
 * type Case1 = FindDuplicateElementInArray<typeof data>;
 * // Result: ["Encountered value with duplicates:", [1, 2]]
 *
 * type Case2 = FindDuplicateElementInArray<['Lorem', 'ipsum', 'dolor', 4, 'Lorem']>;
 * // Result: ["Encountered value with duplicates:", "Lorem"]
 * ```
 */
export type FindDuplicateElementInArray<T> = T extends readonly [infer X, ...infer Rest]
  ? CheckElementExistInArray<Rest, X> extends true
    ? ['Encountered value with duplicates:', X]
    : readonly [X, ...FindDuplicateElementInArray<Rest>]
  : T;
