import { BuiltIn } from '../../../@essentials';

type NativeInstances = [File];

/**
 * Recursively transforms all properties of an object, including nested objects, into required properties.
 * Optionally, specific types within the object can be excluded from this transformation, retaining their original optional structure.
 *
 * @template T - The object type to transform.
 * @template RetainOriginalStructure - A tuple of types that should retain their original optional structure.
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
 * // Transforms all properties to required.
 * type RequiredUserProfile = DeepRequired<PartialUserProfile>;
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
 * type RequiredUserProfileButRetainDetail = DeepRequired<PartialUserProfile, [Detail]>;
 * // Resulting type:
 * // {
 * //   id: number;
 * //   details: Detail;
 * // }
 * ```
 */
export type DeepRequired<T, RetainOriginalStructure extends object[] = []> = T extends BuiltIn
  ? NonNullable<T>
  : T extends Map<infer K, infer V>
    ? Map<DeepRequired<K, RetainOriginalStructure>, DeepRequired<V, RetainOriginalStructure>>
    : T extends ReadonlyMap<infer K, infer V>
      ? ReadonlyMap<DeepRequired<K, RetainOriginalStructure>, DeepRequired<V, RetainOriginalStructure>>
      : T extends WeakMap<infer K, infer V>
        ? WeakMap<DeepRequired<K, RetainOriginalStructure>, DeepRequired<V, RetainOriginalStructure>>
        : T extends Set<infer U>
          ? Set<DeepRequired<U, RetainOriginalStructure>>
          : T extends ReadonlySet<infer U>
            ? ReadonlySet<DeepRequired<U, RetainOriginalStructure>>
            : T extends WeakSet<infer U>
              ? WeakSet<DeepRequired<U, RetainOriginalStructure>>
              : T extends Promise<infer U>
                ? Promise<DeepRequired<U, RetainOriginalStructure>>
                : T extends NativeInstances[number] | RetainOriginalStructure[number]
                  ? T
                  : T extends {}
                    ? { [K in keyof T]-?: DeepRequired<T[K], RetainOriginalStructure> }
                    : NonNullable<T>;
