import { Head } from '../../Head';
import { Length } from '../../Length';
import { Push } from '../../Push';
import { Tail } from '../../Tail';

type DropFromTail_<T extends any[], N extends number, I extends any[] = []> = {
  0: DropFromTail_<Tail<T>, N, Push<I, Head<T>>>;
  1: I;
}[Length<T> extends N ? 1 : 0];

/**
 * Removes a specified number of elements from the end (tail) of a tuple type.
 *
 * @template T - The type of the tuple to be truncated.
 * @template N - The number of elements to remove from the tail of the tuple.
 * @param {T} list - The source tuple type.
 * @param {N} count - The number of elements to drop from the tail of the tuple.
 * @returns {TruncatedTuple} - The resulting tuple type after removing the specified number of elements from the tail.
 *
 * @example
 * ```typescript
 * type Case1 = DropFromTail<[1, 2, 3, 4], 2>; // Result: [1, 2]
 * type Case2 = DropFromTail<[1, 2, 3, 4], 3>; // Result: [1]
 * type Case3 = DropFromTail<[1, 2, 3, 4], 4>; // Result: []
 * ```
 */
export type DropFromTail<T extends any[], N extends number, I extends any[] = []> = DropFromTail_<T, N, I>;
