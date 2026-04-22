/**
 * Determines if a given property within an object type is required.
 *
 * @template T - The object type.
 * @template K - The key of the property to check.
 * @param {T} sourceObject - The object type containing the property.
 * @param {K} targetKey - The key of the property to check.
 * @returns {boolean} `true` if the property is required, otherwise `false`.
 *
 * @example
 * ```typescript
 * type UserProfile = {
 *   id: number;
 *   name?: string;
 *   age: number;
 * };
 *
 * type IsNameRequired = IsRequired<UserProfile, 'name'>;
 * // Result: false
 * ```
 */
export type IsRequired<T, K extends keyof T> = Pick<T, K> extends Record<K, T[K]> ? true : false;
