import { BuiltIn, TakeIfIsTupleOrNever } from '../../../@essentials';

type NativeInstances = [File];

/**
 * Recursively transforms all properties of an object, including nested objects, into undefinable properties (`undefined`).
 * Optionally, specific types within the object can be excluded from this transformation, preserving their original defined structure.
 *
 * @template Type - The object type to transform.
 * @template RetainOriginalStructure - A tuple of types that should retain their original defined structure.
 *
 * @example
 * ```typescript
 * interface Detail {
 *   name: string;
 *   age: number;
 * }
 * interface DefinedUserProfile {
 *   id: number;
 *   details: Detail;
 * }
 *
 * // Transforms all properties to undefinable.
 * type UndefinableUserProfile = DeepUndefinable<DefinedUserProfile>;
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
 * type UndefinableUserProfileButRetainDetail = DeepUndefinable<DefinedUserProfile, [Detail]>;
 * // Resulting type:
 * // {
 * //   id: number | undefined;
 * //   details: Detail | undefined;
 * // }
 * ```
 */
export type DeepUndefinable<Type, RetainOriginalStructure extends object[] = []> = Type extends BuiltIn
  ? Type | undefined
  : Type extends Map<infer Keys, infer Values>
    ? Map<DeepUndefinable<Keys, RetainOriginalStructure>, DeepUndefinable<Values, RetainOriginalStructure>>
    : Type extends ReadonlyMap<infer Keys, infer Values>
      ? ReadonlyMap<DeepUndefinable<Keys, RetainOriginalStructure>, DeepUndefinable<Values, RetainOriginalStructure>>
      : Type extends WeakMap<infer Keys, infer Values>
        ? // TODO: replace it with WeakKey (introduced at TypeScript@5.2)
          // WeakMap key has to satisfy WeakKey which is object at the moment
          DeepUndefinable<Keys, RetainOriginalStructure> extends object
          ? WeakMap<DeepUndefinable<Keys, RetainOriginalStructure>, DeepUndefinable<Values, RetainOriginalStructure>>
          : never
        : Type extends Set<infer Values>
          ? Set<DeepUndefinable<Values, RetainOriginalStructure>>
          : Type extends ReadonlySet<infer Values>
            ? ReadonlySet<DeepUndefinable<Values, RetainOriginalStructure>>
            : Type extends WeakSet<infer Values>
              ? // TODO: replace it with WeakKey (introduced at TypeScript@5.2)
                // WeakSet key has to satisfy WeakKey which is object at the moment
                DeepUndefinable<Values, RetainOriginalStructure> extends object
                ? WeakSet<DeepUndefinable<Values, RetainOriginalStructure>>
                : never
              : Type extends ReadonlyArray<infer Values>
                ? Type extends TakeIfIsTupleOrNever<Type>
                  ? { [Key in keyof Type]: DeepUndefinable<Type[Key], RetainOriginalStructure> | undefined }
                  : Type extends Array<Values>
                    ? Array<DeepUndefinable<Values, RetainOriginalStructure>>
                    : ReadonlyArray<DeepUndefinable<Values, RetainOriginalStructure>>
                : Type extends Promise<infer Value>
                  ? Promise<DeepUndefinable<Value, RetainOriginalStructure>>
                  : Type extends NativeInstances[number] | RetainOriginalStructure[number]
                    ? Type | undefined
                    : Type extends {}
                      ? { [Key in keyof Type]: DeepUndefinable<Type[Key], RetainOriginalStructure> }
                      : Type | undefined;
