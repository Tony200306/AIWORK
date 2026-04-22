import { HasTail } from '../../HasTail';
import { Head } from '../../Head';
import { Tail } from '../../Tail';

/**
 * Extracts the type of the last element from a tuple type.
 *
 * @template T - The type of the tuple from which to extract the last element.
 * @param {T} list - The source tuple type.
 * @returns {LastElementType} - The type of the last element in the tuple.
 *
 * @example
 * ```typescript
 * type Case1 = Last<[1, 2, 3, 4]>; // Result: 4
 * type Case2 = Last<['a', 'b', 'c']>; // Result: 'c'
 * type Case3 = Last<[]>; // Result: never (empty tuple)
 * ```
 */
export type Last<T extends any[]> = {
  0: Last<Tail<T>>;
  1: Head<T>;
}[HasTail<T> extends true ? 0 : 1];
