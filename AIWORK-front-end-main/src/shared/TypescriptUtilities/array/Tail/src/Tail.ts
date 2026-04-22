// export type Tail<T extends any[]> = ((...t: T) => any) extends ((_: any, ...args: infer TT) => any) ? TT : never;

/**
 * Extracts all elements of a tuple type, excluding the first element.
 *
 * @template T - The original tuple type.
 * @param {T} tuple - The source tuple type.
 * @returns {TailTuple} - The tuple type with the first element removed.
 *
 * @example
 * ```typescript
 * type Case1 = Tail<[1, 2, 3, 4, 5]>; // Result: [2, 3, 4, 5]
 * type Case2 = Tail<['name', 'age', 'address']>; // Result: ['age', 'address']
 * type Case3 = Tail<[boolean]>; // Result: []
 * type Case4 = Tail<[]>; // Result: []
 * ```
 */
export type Tail<T> = T extends [infer _I, ...infer Rest] ? Rest : never;
