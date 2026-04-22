/**
 * Determines whether a given tuple type has tail elements, i.e., elements following the first element.
 *
 * @template T - The type of the tuple to be checked.
 * @param {T} list - The source tuple type.
 * @returns {boolean} - `true` if the tuple has tail elements, `false` otherwise.
 *
 * @example
 * ```typescript
 * type Case1 = HasTail<[]>; // Result: false
 * type Case2 = HasTail<[1]>; // Result: false
 * type Case3 = HasTail<[1, 2, 3]>; // Result: true
 * ```
 */
export type HasTail<T extends any[]> = T extends [] | [any] ? false : true;
