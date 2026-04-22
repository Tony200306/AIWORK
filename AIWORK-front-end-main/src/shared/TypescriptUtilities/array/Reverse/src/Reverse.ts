import { Length } from '../../Length';
import { Unshift } from '../../Unshift';

type Position<T extends any[]> = Length<T>;
type Next<T extends any[]> = Unshift<T, any>;

/**
 * Reverses the order of elements within a tuple type.
 *
 * @template T - The tuple type to be reversed.
 * @param {T} tuple - The source tuple type.
 * @returns {ReversedTuple} - The tuple type with elements in reversed order.
 *
 * @example
 * ```typescript
 * type Case1 = Reverse<[1, 2, 3, 4]>; // Result: [4, 3, 2, 1]
 * type Case2 = Reverse<['a', 'b', 'c']>; // Result: ['c', 'b', 'a']
 * type Case3 = Reverse<[]>; // Result: []
 * ```
 */
export type Reverse<T extends any[], R extends any[] = [], I extends any[] = []> = {
  0: Reverse<T, Unshift<R, T[Position<I>]>, Next<I>>;
  1: R;
}[Position<I> extends Length<T> ? 1 : 0];
