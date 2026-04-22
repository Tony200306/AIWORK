import { BuiltIn } from '../../../@essentials';

type NativeInstances = [File];

/**
 * Recursively transforms all properties of an object, including nested objects, from nullable (`null` or `undefined`) to non-nullable.
 * Optionally, specific types within the object can be excluded from this transformation, retaining their original nullable structure.
 *
 * @template T - The object type to transform.
 * @template RetainOriginalStructure - A tuple of types that should retain their original nullable structure.
 *
 * @example
 * ```typescript
 * interface Detail {
 *   name: string | null;
 *   age?: number;
 * }
 * interface NullableUserProfile {
 *   id: number | null;
 *   details: Detail | null;
 * }
 *
 * // Transforms all properties to non-nullable.
 * type NonNullableUserProfile = DeepNonNullable<NullableUserProfile>;
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
 * type NonNullableUserProfileButRetainDetail = DeepNonNullable<NullableUserProfile, [Detail]>;
 * // Resulting type:
 * // {
 * //   id: number;
 * //   details: Detail;
 * // }
 * ```
 */
export type DeepNonNullable<T, RetainOriginalStructure extends object[] = []> = T extends BuiltIn
  ? NonNullable<T>
  : T extends Map<infer K, infer V>
    ? Map<DeepNonNullable<K, RetainOriginalStructure>, DeepNonNullable<V, RetainOriginalStructure>>
    : T extends ReadonlyMap<infer K, infer V>
      ? ReadonlyMap<DeepNonNullable<K, RetainOriginalStructure>, DeepNonNullable<V, RetainOriginalStructure>>
      : T extends WeakMap<infer K, infer V>
        ? WeakMap<DeepNonNullable<K, RetainOriginalStructure>, DeepNonNullable<V, RetainOriginalStructure>>
        : T extends Set<infer U>
          ? Set<DeepNonNullable<U, RetainOriginalStructure>>
          : T extends ReadonlySet<infer U>
            ? ReadonlySet<DeepNonNullable<U, RetainOriginalStructure>>
            : T extends WeakSet<infer U>
              ? WeakSet<DeepNonNullable<U, RetainOriginalStructure>>
              : T extends Promise<infer U>
                ? Promise<DeepNonNullable<U, RetainOriginalStructure>>
                : T extends NativeInstances[number] | RetainOriginalStructure[number]
                  ? T
                  : T extends {}
                    ? { [K in keyof T]: DeepNonNullable<T[K], RetainOriginalStructure> }
                    : NonNullable<T>;
