type NativeInstances = [File];

/**
 * Recursively transforms all properties of an object, including nested objects, into partial properties (`undefined`).
 * Optionally, specific types within the object can be excluded from this transformation, retaining their original structure.
 *
 * @template T - The object type to transform.
 * @template RetainOriginalStructure - A tuple of types that should retain their original structure.
 *
 * @example
 * ```typescript
 * interface Detail {
 *   name: string;
 *   age: number;
 * }
 * interface UserProfile {
 *   id: number;
 *   details: Detail;
 * }
 *
 * // Transforms all properties to partial.
 * type PartialUserProfile = DeepPartial<UserProfile>;
 * // Resulting type:
 * // {
 * //   id?: number;
 * //   details?: {
 * //     name?: string;
 * //     age?: number;
 * //   };
 * // }
 *
 * // Retains the structure of the `details` property by specifying it in the second generic parameter.
 * type PartialUserProfileButRetainDetail = DeepPartial<UserProfile, [Detail]>;
 * // Resulting type:
 * // {
 * //   id?: number;
 * //   details?: Detail;
 * // }
 * ```
 */
export type DeepPartial<T, RetainOriginalStructure extends object[] = []> = T extends
  | NativeInstances[number]
  | RetainOriginalStructure[number]
  ? T
  : T extends object
    ? { [P in keyof T]?: DeepPartial<T[P], RetainOriginalStructure> }
    : T;
