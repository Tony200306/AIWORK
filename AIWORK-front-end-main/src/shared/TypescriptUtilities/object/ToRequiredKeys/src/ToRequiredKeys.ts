/**
 * Transforms an optional key in an object type into a required key.
 *
 * @param {object} sourceObject - The source object whose optional properties will be modified.
 * @param {union} keys - The key (or keys) from the object type that you wish to convert from optional to required.
 *
 * @example
 * ```typescript
 * type Case1 = ToRequiredKeys<{ a?: string; b: number }, 'a'>;
 *
 * // Result type:
 * // {
 * //   a: string; // The optional property `a` is converted to a required property.
 * //   b: number; // The property `b` remains unchanged.
 * // }
 * ```
 */
export type ToRequiredKeys<T, RK extends keyof T> = Omit<T, RK> & Required<Pick<T, RK>>;
