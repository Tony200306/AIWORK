/**
 * Dynamically adds a key-value pair to a given object type.
 *
 * @param {object} sourceObject - The source object to which the key-value pair will be added.
 * @param {string} newKey - The key to be added to the object.
 * @param {any} newValue - The value associated with the new key.
 *
 * @example
 * ```typescript
 * type Case1 = AppendToObjectWithKeyValue<{ a: string }, 'abc', 123>;
 * // Result: { abc: 123; a: string; }
 * ```
 */
export type AppendToObjectWithKeyValue<T, Key extends string, Value> = {
  [key in keyof T | Key]: key extends keyof T ? T[key] : Value;
};
