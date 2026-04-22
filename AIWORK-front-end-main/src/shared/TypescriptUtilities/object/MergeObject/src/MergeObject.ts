/**
 * Take two objects T and U and create the new one with uniq keys for T a U objectI
 */
type GetObjDifferentKeys<T, U, T0 = Omit<T, keyof U> & Omit<U, keyof T>, T1 = { [K in keyof T0]: T0[K] }> = T1;
/**
 * Take two objects T and U and create the new one with the same objects keys
 */
type GetObjSameKeys<T, U> = Omit<T | U, keyof GetObjDifferentKeys<T, U>>;

type MergeTwoObjects<
  T,
  U,
  // non shared keys are optional
  T0 = Partial<GetObjDifferentKeys<T, U>> & {
    [K in keyof GetObjSameKeys<T, U>]: MergeObject<T[K], U[K]>;
  }, // shared keys are recursively resolved by `DeepMergeTwoTypes<...>`
  T1 = { [K in keyof T0]: T0[K] },
> = T1;

/**
 * Merges two object types into a single object type.
 *
 * @param {object} firstObject - The first object to merge.
 * @param {object} secondObject - The second object to merge.
 *
 * @example
 * ```typescript
 * interface X {
 *   a: 1;
 *   b: number;
 * }
 *
 * interface Y {
 *   a: 2;
 *   b: string;
 *   c: boolean;
 * }
 *
 * type CombinedType = MergeObject<X, Y>;
 *
 * // Result type:
 * // {
 * //   a: 1 | 2;
 * //   b: number | string;
 * //   c?: boolean;
 * // }
 * ```
 */
export type MergeObject<T, U> = [T, U] extends [object, object] ? MergeTwoObjects<T, U> : T | U;

// https://github.com/Svehla/TS_DeepMerge
