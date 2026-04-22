//https://github.com/microsoft/TypeScript/issues/40250
// This method isn't very good, but it can't be recursive, so it's temporary.
type FlatArray_<A extends unknown[]> = ReturnType<
  A extends [infer U, ...infer V]
    ? U extends unknown[]
      ? () => [...U, ...FlatArray_<V>]
      : () => [U, ...FlatArray_<V>]
    : () => A
>;

/**
 * Flattens arrays that contain exactly one level of nested arrays.
 *
 * @template T - The type of the source array, which may contain one level of nested arrays.
 * @param {T} list - The source array type.
 * @returns {FlattenedArray} - The resulting array type with one level of nesting flattened.
 *
 * @example
 * ```typescript
 * type Case1 = FlatArray<[['a', 'b'], ['c', 'd']]>;
 * // Result: ["a", "b", "c", "d"]
 *
 * type Case2 = FlatArray<[['a', 'b', ['e', 'g', 'h']], ['c', 'd']]>;
 * // Result: ["a", "b", ['e', 'g', 'h'], "c", "d"]
 * ```
 */
export type FlatArray<A extends unknown[]> = FlatArray_<A>;
