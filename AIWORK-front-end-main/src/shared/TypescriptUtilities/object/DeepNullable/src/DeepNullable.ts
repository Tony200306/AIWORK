import { BuiltIn, TakeIfIsTupleOrNever } from '../../../@essentials';

type NativeInstances = [File];

/**
 * Recursively transforms all properties of an object, including nested objects, into nullable properties (`null` or `undefined`).
 * Optionally, specific types within the object can be excluded from this transformation, preserving their original non-nullable structure.
 *
 * @template Type - The object type to transform.
 * @template RetainOriginalStructure - A tuple of types that should retain their original non-nullable structure.
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
 * // Transforms all properties to nullable.
 * type NullableUserProfile = DeepNullable<UserProfile>;
 * // Resulting type:
 * // {
 * //   id: number | null;
 * //   details: {
 * //     name: string | null;
 * //     age: number | null;
 * //   };
 * // }
 *
 * // Retains the structure of the `details` property by specifying it in the second generic parameter.
 * type NullableUserProfileButRetainDetail = DeepNullable<UserProfile, [Detail]>;
 * // Resulting type:
 * // {
 * //   id: number | null;
 * //   details: Detail | null;
 * // }
 * ```
 */
export type DeepNullable<Type, RetainOriginalStructure extends object[] = []> = Type extends BuiltIn
  ? Type | null
  : Type extends Map<infer Keys, infer Values>
    ? Map<DeepNullable<Keys, RetainOriginalStructure>, DeepNullable<Values, RetainOriginalStructure>>
    : Type extends ReadonlyMap<infer Keys, infer Values>
      ? ReadonlyMap<DeepNullable<Keys, RetainOriginalStructure>, DeepNullable<Values, RetainOriginalStructure>>
      : Type extends WeakMap<infer Keys, infer Values>
        ? // @ts-ignore
          WeakMap<DeepNullable<Keys, RetainOriginalStructure>, DeepNullable<Values, RetainOriginalStructure>>
        : Type extends Set<infer Values>
          ? Set<DeepNullable<Values, RetainOriginalStructure>>
          : Type extends ReadonlySet<infer Values>
            ? ReadonlySet<DeepNullable<Values, RetainOriginalStructure>>
            : Type extends WeakSet<infer Values>
              ? // @ts-ignore
                WeakSet<DeepNullable<Values, RetainOriginalStructure>>
              : Type extends ReadonlyArray<infer Values>
                ? Type extends TakeIfIsTupleOrNever<Type>
                  ? { [Key in keyof Type]: DeepNullable<Type[Key], RetainOriginalStructure> | null }
                  : Type extends Array<Values>
                    ? Array<DeepNullable<Values, RetainOriginalStructure>>
                    : ReadonlyArray<DeepNullable<Values, RetainOriginalStructure>>
                : Type extends Promise<infer Value>
                  ? Promise<DeepNullable<Value, RetainOriginalStructure>>
                  : Type extends NativeInstances[number] | RetainOriginalStructure[number]
                    ? Type | null
                    : Type extends {}
                      ? { [Key in keyof Type]: DeepNullable<Type[Key], RetainOriginalStructure> }
                      : Type | null;
