type NativeInstances = [File];

/**
 * Recursively transforms all properties of an object, including nested objects, from `null` to `undefined`.
 * Optionally, specific types within the object can be excluded from this transformation, retaining their original `null` values.
 *
 * @template T - The object type to transform.
 * @template RetainOriginalStructure - A tuple of types that should retain their original `null` values.
 *
 * @example
 * ```typescript
 * interface Detail {
 *   name: string | null;
 *   age: number | null;
 * }
 * interface NullableUserProfile {
 *   id: number | null;
 *   details: Detail;
 * }
 *
 * // Transforms all `null` properties to `undefined`.
 * type UndefinedUserProfile = DeepReplaceNullWithUndefined<NullableUserProfile>;
 * // Resulting type:
 * // {
 * //   id: number | undefined;
 * //   details: {
 * //     name: string | undefined;
 * //     age: number | undefined;
 * //   };
 * // }
 *
 * // Retains the structure of the `details` property by specifying it in the second generic parameter.
 * type UndefinedUserProfileButRetainDetail = DeepReplaceNullWithUndefined<NullableUserProfile, [Detail]>;
 * // Resulting type:
 * // {
 * //   id: number | undefined;
 * //   details: Detail;
 * // }
 * ```
 */
export type DeepReplaceNullWithUndefined<T, RetainOriginalStructure extends object[] = []> = T extends null
  ? undefined
  : T extends NativeInstances[number] | RetainOriginalStructure[number]
    ? T
    : T extends object
      ? { [K in keyof T]: DeepReplaceNullWithUndefined<T[K], RetainOriginalStructure> }
      : T;
