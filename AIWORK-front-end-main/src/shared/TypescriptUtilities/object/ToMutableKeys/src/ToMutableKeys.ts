type Writable<T> = { -readonly [P in keyof T]: T[P] };

/**
 * Transforms specified `readonly` properties of an object type into mutable ones.
 *
 * @param {object} sourceObject - The source object whose `readonly` properties will be transformed.
 * @param {string} targetKey - The key of the `readonly` property to be transformed into a mutable property.
 *
 * @example
 * ```typescript
 * type Case1 = ToMutableKeys<{ readonly a: string; b: string }, 'a'>;
 *
 * // Result type:
 * // {
 * //   a: string; // The `readonly` property `a` is transformed into a mutable property.
 * //   b: string; // The property `b` remains unchanged.
 * // }
 * ```
 */
export type ToMutableKeys<T, K extends keyof T> = Omit<T, K> & Writable<Pick<T, K>>;
