import { BuiltIn, IsUnknown } from '../../../@essentials';

type NativeInstances = [File];

/**
 * Recursively transforms all properties of an object, including nested objects, from `readonly` to mutable.
 * Optionally, specific types within the object can be excluded from this transformation, retaining their original structure.
 *
 * @template Type - The object type to transform.
 * @template RetainOriginalStructure - A tuple of types that should remain unchanged, preserving their readonly structure.
 *
 * @example
 * ```typescript
 * interface Detail {
 *   name: string;
 *   age: number;
 * }
 * interface ImmutableUserProfile {
 *   readonly id: number;
 *   readonly details: Detail;
 * }
 *
 * // Transforms all properties to mutable.
 * type MutableUserProfile = DeepMutable<ImmutableUserProfile>;
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
 * type MutableUserProfileButRetainDetail = DeepMutable<ImmutableUserProfile, [Detail]>;
 * // Resulting type:
 * // {
 * //   id: number;
 * //   details: Detail;
 * // }
 * ```
 */
export type DeepMutable<Type, RetainOriginalStructure extends object[] = []> =
  Type extends Exclude<BuiltIn, Error>
    ? Type
    : Type extends Map<infer Key, infer Value>
      ? Map<DeepMutable<Key, RetainOriginalStructure>, DeepMutable<Value, RetainOriginalStructure>>
      : Type extends ReadonlyMap<infer Key, infer Value>
        ? Map<DeepMutable<Key, RetainOriginalStructure>, DeepMutable<Value, RetainOriginalStructure>>
        : Type extends WeakMap<infer Key, infer Value>
          ? WeakMap<DeepMutable<Key, RetainOriginalStructure>, DeepMutable<Value, RetainOriginalStructure>>
          : Type extends Set<infer Values>
            ? Set<DeepMutable<Values, RetainOriginalStructure>>
            : Type extends ReadonlySet<infer Values>
              ? Set<DeepMutable<Values, RetainOriginalStructure>>
              : Type extends WeakSet<infer Values>
                ? WeakSet<DeepMutable<Values, RetainOriginalStructure>>
                : Type extends Promise<infer Value>
                  ? Promise<DeepMutable<Value, RetainOriginalStructure>>
                  : Type extends NativeInstances[number] | RetainOriginalStructure[number]
                    ? Type
                    : Type extends {}
                      ? { -readonly [Key in keyof Type]: DeepMutable<Type[Key], RetainOriginalStructure> }
                      : IsUnknown<Type> extends true
                        ? unknown
                        : Type;
