/**
 * Converts specified required properties of an object type into optional ones.
 *
 * @param {object} sourceObject - The source object whose required properties will be modified.
 * @param {string} targetKey - The key of the required property to be converted into an optional property.
 *
 * @example
 * ```typescript
 * type Case1 = ToOptionalKeys<{ a: string }, 'a'>;
 *
 * // Result type:
 * // {
 * //   a?: string; // The required property `a` is converted to an optional property.
 * // }
 * ```
 */
export type ToOptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
