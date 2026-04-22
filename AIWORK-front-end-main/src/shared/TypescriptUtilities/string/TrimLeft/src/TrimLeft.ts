/**
 * Removes whitespace from the start of a string type.
 *
 * @param {string} sourceString - The source string from which leading whitespace will be removed.
 *
 * @example
 * ```typescript
 * type Case1 = TrimLeft<'      Space in left will be removed'>;
 *
 * // Result type:
 * // 'Space in left will be removed'
 * ```
 */
export type TrimLeft<V extends string> = V extends ` ${infer R}` ? TrimLeft<R> : V;
