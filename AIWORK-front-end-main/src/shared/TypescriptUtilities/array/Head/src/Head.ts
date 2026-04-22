// export type Head<T extends any[]> = T extends [any, ...any[]] ? T[0] : never;

/**
 * Extracts the type of the first element from a tuple type.
 *
 * @template T - The type of the tuple to extract the first element from.
 * @param {T} list - The source tuple type.
 * @returns {HeadType} - The type of the first element in the tuple.
 *
 * @example
 * ```typescript
 * type Case1 = Head<[1, 2, string, boolean]>; // Result: 1
 * type Case2 = Head<[string, number]>; // Result: string
 * type Case3 = Head<[]>; // Result: never (empty tuple)
 * ```
 */
export type Head<T> = T extends [infer I, ...infer _Rest] ? I : never;
