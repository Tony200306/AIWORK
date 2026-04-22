/**
 * Replaces a specified substring with another within a string type.
 *
 * @param {string} sourceString - The source string where the replacement will occur.
 * @param {string} searchValue - The substring to be replaced.
 * @param {string} newValue - The substring to replace the `searchValue` with.
 *
 * @example
 * ```typescript
 * const str = `Lorem Ipsum is simply dummy text`;
 * type Case1 = Replace<typeof str, 'Lorem Ipsum', 'abc'>;
 *
 * // Result type:
 * // "abc is simply dummy text"
 * ```
 */
export type Replace<Source extends string, SearchValue extends string, NewValue extends string> = SearchValue extends ''
  ? Source
  : Source extends `${infer Head}${SearchValue}${infer Tail}`
    ? `${Head}${NewValue}${Tail}`
    : Source;
