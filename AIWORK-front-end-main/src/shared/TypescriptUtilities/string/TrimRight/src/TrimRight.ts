/**
 * Eliminates whitespace from the end of a string type.
 *
 * @param {string} sourceString - The source string from which trailing whitespace will be removed.
 *
 * @example
 * ```typescript
 * type Case1 = TrimRight<'Space at right will be removed           '>;
 *
 * // Result type:
 * // 'Space at right will be removed'
 * ```
 */
export type TrimRight<V extends string> = V extends `${infer R} ` ? TrimRight<R> : V;
