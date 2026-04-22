/**
 * Transforms specified mutable properties of an object type into `readonly` ones.
 *
 * @param {object} sourceObject - The source object whose mutable properties will be modified.
 * @param {string} targetKey - The key of the mutable property to be converted into a `readonly` property.
 *
 * @example
 * ```typescript
 * type Case1 = ToReadonlyKeys<{ a: string; b: string }, 'a'>;
 *
 * // Result type:
 * // {
 * //   readonly a: string; // The mutable property `a` is converted to a `readonly` property.
 * //   b: string; // The property `b` remains unchanged.
 * // }
 * ```
 */
export type ToReadonlyKeys<T, K extends keyof T> = Omit<T, K> & Readonly<Pick<T, K>>;
