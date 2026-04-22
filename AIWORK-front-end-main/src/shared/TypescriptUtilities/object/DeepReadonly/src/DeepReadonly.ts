import { BuiltIn, IsUnknown } from '../../../@essentials';

type NativeInstances = [File];

/**
 * Recursively transforms all properties of an object, including nested objects, into readonly properties.
 * Optionally, specific types within the object can be excluded from this transformation, retaining their original mutable structure.
 *
 * @template T - The object type to transform.
 * @template RetainOriginalStructure - A tuple of types that should retain their original mutable structure.
 *
 * @example
 * ```typescript
 * interface Detail {
 *   name: string;
 *   age: number;
 * }
 * interface MutableUserProfile {
 *   id: number;
 *   details: Detail;
 * }
 *
 * // Transforms all properties to readonly.
 * type ReadonlyUserProfile = DeepReadonly<MutableUserProfile>;
 * // Resulting type:
 * // {
 * //   readonly id: number;
 * //   readonly details: {
 * //     readonly name: string;
 * //     readonly age: number;
 * //   };
 * // }
 *
 * // Retains the structure of the `details` property by specifying it in the second generic parameter.
 * type ReadonlyUserProfileButRetainDetail = DeepReadonly<MutableUserProfile, [Detail]>;
 * // Resulting type:
 * // {
 * //   readonly id: number;
 * //   readonly details: Detail;
 * // }
 * ```
 */
export type DeepReadonly<T, RetainOriginalStructure extends object[] = []> = T extends BuiltIn
  ? T
  : T extends Map<infer K, infer V>
    ? ReadonlyMap<DeepReadonly<K, RetainOriginalStructure>, DeepReadonly<V, RetainOriginalStructure>>
    : T extends ReadonlyMap<infer K, infer V>
      ? ReadonlyMap<DeepReadonly<K, RetainOriginalStructure>, DeepReadonly<V, RetainOriginalStructure>>
      : T extends WeakMap<infer K, infer V>
        ? WeakMap<DeepReadonly<K, RetainOriginalStructure>, DeepReadonly<V, RetainOriginalStructure>>
        : T extends Set<infer U>
          ? ReadonlySet<DeepReadonly<U, RetainOriginalStructure>>
          : T extends ReadonlySet<infer U>
            ? ReadonlySet<DeepReadonly<U, RetainOriginalStructure>>
            : T extends WeakSet<infer U>
              ? WeakSet<DeepReadonly<U, RetainOriginalStructure>>
              : T extends Promise<infer U>
                ? Promise<DeepReadonly<U, RetainOriginalStructure>>
                : T extends NativeInstances[number] | RetainOriginalStructure[number]
                  ? T
                  : T extends {}
                    ? { readonly [K in keyof T]: DeepReadonly<T[K], RetainOriginalStructure> }
                    : IsUnknown<T> extends true
                      ? unknown
                      : Readonly<T>;
