// https://github.com/microsoft/TypeScript/pull/40336

/**
 * Concatenates elements of a tuple into a single string type with a specified delimiter.
 *
 * @template T - The tuple type containing string or number elements to be concatenated.
 * @template D - The delimiter used to join the elements into a string.
 * @param {T} list - The tuple of elements to be joined.
 * @param {D} delimiter - The delimiter to use between elements in the resulting string.
 * @returns {JoinedString} - The resulting string with elements joined by the delimiter.
 *
 * @example
 * ```typescript
 * type Case1 = Join<[1, 2, 3, 4], '.'>;  // '1.2.3.4'
 * type Case2 = Join<['foo', 'bar', 'baz'], '-'>;  // 'foo-bar-baz'
 * type Case3 = Join<[], '.'>;  // ''
 * ```
 */
export type Join<T extends unknown[], D extends string> = T extends []
  ? ''
  : T extends [string | number | boolean | bigint]
    ? `${T[0]}`
    : T extends [string | number | boolean | bigint, ...infer U]
      ? `${T[0]}${D}${Join<U, D>}`
      : string;
