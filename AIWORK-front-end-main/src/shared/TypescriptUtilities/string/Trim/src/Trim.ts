import { TrimLeft } from '../../TrimLeft';
import { TrimRight } from '../../TrimRight';

/**
 * Removes whitespace from the start and end of a string type.
 *
 * @param {string} sourceString - The source string from which leading and trailing whitespace will be removed.
 *
 * @example
 * ```typescript
 * type Case1 = Trim<'     unnecessary space will be removed         '>;
 *
 * // Result type:
 * // 'unnecessary space will be removed'
 * ```
 */
export type Trim<V extends string> = TrimLeft<TrimRight<V>>;
