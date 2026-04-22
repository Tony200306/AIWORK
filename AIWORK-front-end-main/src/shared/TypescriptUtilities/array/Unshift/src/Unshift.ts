/**
 * Simulates adding a single element to the beginning of a tuple type.
 *
 * @template T - The original tuple type.
 * @template E - The type of the element to be added at the beginning.
 * @param {T} tuple - The source tuple type.
 * @param {E} newItem - The element to be added to the beginning of the tuple.
 * @returns {ExtendedTuple} - The resulting tuple type with the new element prepended.
 *
 * @example
 * ```typescript
 * type Case1 = Unshift<[1, 2, 3], 4>; // Result: [4, 1, 2, 3]
 * type Case2 = Unshift<[number, boolean], string>; // Result: [string, number, boolean]
 * type Case3 = Unshift<[], boolean>; // Result: [boolean]
 * ```
 */
export type Unshift<T extends any[], E> = ((head: E, ...args: T) => any) extends (...args: infer U) => any ? U : T;
