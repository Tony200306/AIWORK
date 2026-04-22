import { Recurse } from '../../../@essentials';
import { Push } from '../../../array';

// https://github.com/microsoft/TypeScript/pull/40336
type _Split<
  SourceString extends string,
  Separator extends string,
  Result extends any[] = [],
> = SourceString extends `${infer T}${Separator}${infer U}`
  ? { __rec: _Split<U, Separator, Push<Result, T>> }
  : Push<Result, SourceString>;

/**
 * Divides a string type into a tuple of substrings based on a specified delimiter.
 *
 * @param {string} sourceString - The source string to be split into substrings.
 * @param {string} separator - The delimiter used to split the `sourceString` into substrings.
 *
 * @example
 * ```typescript
 * const string = `Lorem Ipsum`;
 * type _Case1 = Split<typeof string, ' '>;
 *
 * // Result type:
 * // ["Lorem", "Ipsum"]
 * ```
 */
export type Split<S extends string, D extends string> = Recurse<_Split<S, D>>;
