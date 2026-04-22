// TS4.1
// https://github.com/microsoft/TypeScript/issues/13298
import { UnionToIntersection } from '../../UnionToIntersection';

/**
 * Converts a union type into its tuple representation.
 *
 * @param {union} union - The source union type to be converted into a tuple.
 *
 * @example
 * ```typescript
 * type Case1 = UnionToTuple<"a" | "b" | "c" | "d">;
 *
 * // Result type:
 * // ["a", "b", "c", "d"]
 * ```
 */
export type UnionToTuple<T> =
  UnionToIntersection<T extends any ? (t: T) => T : never> extends (_: any) => infer W
    ? [...UnionToTuple<Exclude<T, W>>, W]
    : [];
