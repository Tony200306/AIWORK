type NativeInstances = [File];

/**
 * Recursively transforms all properties of an object, including nested objects, from partial (`undefined`) to `null`.
 * Optionally, specific types within the object can be excluded from this transformation, retaining their original partial structure.
 *
 * @template T - The object type to transform.
 * @template RetainOriginalStructure - A tuple of types that should retain their original partial structure.
 *
 * @example
 * ```typescript
 * interface Detail {
 *   name?: string;
 *   age?: number;
 * }
 * interface PartialUserProfile {
 *   id?: number;
 *   details?: Detail;
 * }
 *
 * // Transforms all partial properties to `null`.
 * type NullUserProfile = DeepReplacePartialWithNull<PartialUserProfile>;
 * // Resulting type:
 * // {
 * //   id: number | null;
 * //   details: {
 * //     name: string | null;
 * //     age: number | null;
 * //   } | null;
 * // }
 *
 * // Retains the structure of the `details` property by specifying it in the second generic parameter.
 * type NullUserProfileButRetainDetail = DeepReplacePartialWithNull<PartialUserProfile, [Detail]>;
 * // Resulting type:
 * // {
 * //   id: number | null;
 * //   details: Detail | null;
 * // }
 * ```
 */
export type DeepReplacePartialWithNull<T, RetainOriginalStructure extends object[] = []> = T extends
  | NativeInstances[number]
  | RetainOriginalStructure[number]
  ? T
  : T extends object
    ? { [P in keyof T]-?: DeepReplacePartialWithNull<T[P], RetainOriginalStructure> }
    : T | null;
