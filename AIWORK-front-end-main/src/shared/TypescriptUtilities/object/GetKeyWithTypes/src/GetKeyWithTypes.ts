type PickKeysByValue<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];
type PickProperties<T, P> = Pick<T, PickKeysByValue<T, P>>;

/**
 * Extracts the keys from an object type whose values match a specified type.
 * This utility is useful for filtering object properties based on their value types.
 *
 * @template T - The object type from which to extract keys.
 * @template U - The type to match for the values.
 *
 * @param {T} sourceObject - The source object type to search.
 * @param {U} typeSearch - The type to search for in the values of the object.
 *
 * @example
 * ```typescript
 * type Case1 = GetKeyWithTypes<{ a: number; b?: string; c: string | undefined; d: string }, number>;
 * // Result: "a"
 *
 * type Case2 = GetKeyWithTypes<{ a: number; b?: string; c: string | undefined; d: string }, string | undefined>;
 * // Result: "b" | "c" | "d"
 * ```
 */
export type GetKeyWithTypes<T, P> = Exclude<keyof PickProperties<T, P>, undefined>;
