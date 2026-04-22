import { Length } from '../../Length';
import { Tail } from '../../Tail';
import { Unshift } from '../../Unshift';

type DropFromHead_<T extends any[], N extends number, I extends any[] = []> = {
  0: DropFromHead_<Tail<T>, N, Unshift<I, any>>;
  1: T;
}[Length<I> extends N ? 1 : 0];

/**
 * Removes a specified number of elements from the beginning (head) of an array type.
 *
 * @template T - The type of the source array.
 * @template N - The number of elements to remove from the head of the array.
 * @param {T} list - The source array type.
 * @param {N} count - The number of elements to drop from the head of the array.
 * @returns {DropResult} - The resulting array type after removing the specified number of elements from the head.
 *
 * @example
 * ```typescript
 * type Case1 = DropFromHead<[1, 2, 3, 4, 5], 1>; // [2, 3, 4, 5]
 * type Case2 = DropFromHead<[1, 2, 3, 4, 5], 3>; // [4, 5]
 * type Case3 = DropFromHead<[1, 2, 3, 4, 5], 5>; // []
 * ```
 */
export type DropFromHead<T extends any[], N extends number, I extends any[] = []> = DropFromHead_<T, N, I>;
