/**
 * Simulates adding an element to the end of a tuple type.
 *
 * @template T - The original tuple type.
 * @template E - The type of the element to be added to the tuple.
 * @param {T} tuple - The source tuple type.
 * @param {E} element - The element to be added to the tuple.
 * @returns {ExtendedTuple} - The resulting tuple type with the new element appended.
 *
 * @example
 * ```typescript
 * type Case1 = Push<[1, 2, 3], 4>; // Result: [1, 2, 3, 4]
 * type Case2 = Push<['a', 'b'], 'c'>; // Result: ['a', 'b', 'c']
 * type Case3 = Push<[], number>; // Result: [number]
 * ```
 */
export type Push<T extends any[], E> = ((head: E, ...args: T) => any) extends (
  head: infer Element,
  ...args: infer Array
) => any
  ? [...Array, Element]
  : T;
