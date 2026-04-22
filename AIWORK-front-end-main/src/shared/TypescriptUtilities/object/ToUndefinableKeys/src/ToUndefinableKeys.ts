/**
 * Constructs a type by making specified keys of a type `T` undefinable (i.e., their values can be `undefined`).
 *
 * @template T The original type whose keys need to be modified.
 * @template K A subset of keys from `T` that will be modified to allow `undefined`.
 *
 * @typedef {Omit<T, K> & { [P in K]: T[P] | undefined }} ToUndefinableKeys
 *
 * @example
 * // Transform keys 'a' and 'b' to be undefinable undefined in the given type.
 * type Example = ToUndefinableKeys<{ a: string; b: number; c: boolean }, 'a' | 'b'>;
 * // Result: { c: boolean; a: string | undefined; b: number | undefined; }
 */
export type ToUndefinableKeys<T, K extends keyof T> = Omit<T, K> & { [P in K]: T[P] | undefined };
