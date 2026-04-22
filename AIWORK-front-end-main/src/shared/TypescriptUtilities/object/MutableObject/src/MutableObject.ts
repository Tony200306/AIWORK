/**
 * Transforms all `readonly` properties of an object type into mutable ones.
 *
 * @param {object} sourceObject - The source object whose `readonly` properties will be made mutable.
 *
 * @example
 * ```typescript
 * type User = {
 *   readonly id: number;
 *   readonly name: string;
 *   age: number;
 * };
 *
 * type MutableUser = MutableObject<User>;
 *
 * // Result type:
 * // {
 * //   id: number;
 * //   name: string;
 * //   age: number;
 * // }
 * ```
 */
export type MutableObject<T> = {
  -readonly [K in keyof T]: T[K];
};
