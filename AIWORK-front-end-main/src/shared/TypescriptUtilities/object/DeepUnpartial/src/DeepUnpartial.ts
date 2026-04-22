type NativeInstances = [File];

/**
 * Recursively transforms all properties of an object, including nested objects, from partial (`undefined`) to non-partial.
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
 * // Transforms all properties to non-partial.
 * type NonPartialUserProfile = DeepUnpartial<PartialUserProfile>;
 * // Resulting type:
 * // {
 * //   id: number;
 * //   details: {
 * //     name: string;
 * //     age: number;
 * //   };
 * // }
 *
 * // Retains the structure of the `details` property by specifying it in the second generic parameter.
 * type NonPartialUserProfileButRetainDetail = DeepUnpartial<PartialUserProfile, [Detail]>;
 * // Resulting type:
 * // {
 * //   id: number;
 * //   details: Detail;
 * // }
 * ```
 */
export type DeepUnpartial<T, RetainOriginalStructure extends object[] = []> = T extends
  | NativeInstances[number]
  | RetainOriginalStructure[number]
  ? T
  : T extends object
    ? { [P in keyof T]-?: DeepUnpartial<T[P], RetainOriginalStructure> }
    : T;
