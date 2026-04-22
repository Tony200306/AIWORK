import { DeepUnpartial } from '../../DeepUnpartial/src/DeepUnpartial';

/**
 * The `FormMutationStateValues<FormSchema>` type utility is designed to transform a given type `FormSchema` to handle mutable form states, particularly in contexts where schema validation is performed with libraries such as Zod.
 *
 * This utility processes the original type recursively, making all properties potentially `undefined` or `null` to accommodate the mutable nature of form state during user interactions. Additionally, it allows you to specify certain keys or types to remain unchanged through the `KeysWillKeepOrigin` and `TypesWillKeepOrigin` parameters.
 *
 * **Features:**
 * - Recursively transforms the original type, making all properties optional.
 * - Optionally preserves specific keys or types unchanged.
 * - Supports nested structures to maintain the integrity of certain data.
 *
 * @example
 * ```typescript
 * interface SimpleFormSchema {
 *   file: File;
 *   sectionName: string;
 *   student: {
 *     name: string;
 *   };
 *   someIds: string[];
 *   questions: Array<{
 *     key: string;
 *     questionId: string;
 *     totalTimes: number;
 *     totalPoints: number;
 *     someIdsButInNested: string[];
 *   }>;
 * }
 *
 * type SimpleFormStateValues = FormMutationStateValues<SimpleFormSchema, ['key']>;
 * // Result type:
 * // type SimpleFormStateValues = {
 * //   file: File | undefined;
 * //   sectionName: string | undefined;
 * //   student: {
 * //     name: string | undefined;
 * //   } | undefined;
 * //   someIds: string[] | undefined;
 * //   questions: {
 * //     key: string;
 * //     questionId: string | undefined;
 * //     totalTimes: number | undefined;
 * //     totalPoints: number | undefined;
 * //     someIdsButInNested: string[] | undefined;
 * //   }[] | undefined;
 * // }
 * ```
 *
 * @template FormSchema - The original type to be transformed.
 * @template KeysWillKeepOrigin - An array of property keys whose types should remain unchanged.
 * @template TypesWillKeepOrigin - An array of types that should remain unchanged during transformation.
 * @template RetainOriginalStructure - An array of structures to retain their original form without modification.
 */
export type FormMutationStateValues<
  FormSchema,
  KeysWillKeepOrigin extends string[] = [],
  TypesWillKeepOrigin extends any[] = [],
  RetainOriginalStructure extends object[] = [],
> = MainFormMutationStateValues<
  DeepUnpartial<FormSchema, TypesWillKeepOrigin | RetainOriginalStructure>,
  KeysWillKeepOrigin,
  TypesWillKeepOrigin,
  RetainOriginalStructure
>;

/** Represents primitive types that are commonly used in form values. This can be a `string`, `number`, `boolean`, or `null`. */
type PrimitiveAvailableInFormValues = string | number | boolean | null;
type NativeInstances = [File];

/** Remove optional/nullish wrappers to inspect the "core" type. */
type Clean<T> = Exclude<T, undefined | null>;

/** Detect enum-like primitive types (string/number literal unions or TS enums), not broad string/number. */
type IsEnumLikePrimitive<T> = T extends string
  ? [string] extends [T]
    ? false
    : true // literal string union (or enum) → true; broad string → false
  : T extends number
    ? [number] extends [T]
      ? false
      : true // literal number union (or enum) → true; broad number → false
    : false;

/**
 * Detect enum-like types, including arrays/tuples of enum-like elements.
 * Works even if elements are unioned with undefined/null (after DeepUnpartial).
 * - True for: `MyEnum`, `'a'|'b'`, `readonly ('a'|'b')[]`, `MyEnum[]`, tuples.
 * - False for: broad `string`, `number`, `string[]`, `number[]`, objects, etc.
 */
type IsEnumLike<T> = T extends readonly unknown[]
  ? IsEnumLikePrimitive<Clean<T[number]>>
  : T extends unknown[]
    ? IsEnumLikePrimitive<Clean<T[number]>>
    : IsEnumLikePrimitive<Clean<T>>;

type MainFormMutationStateValues<
  Type,
  KeysWillKeepOrigin extends string[],
  TypesWillKeepOrigin extends any[],
  RetainOriginalStructure extends object[],
> = Type extends
  | RetainOriginalStructure[number]
  | TypesWillKeepOrigin[number]
  | NativeInstances[number]
  | PrimitiveAvailableInFormValues
  ? Type
  : Type extends readonly (infer U)[]
    ? Clean<U> extends
        | RetainOriginalStructure[number]
        | TypesWillKeepOrigin[number]
        | NativeInstances[number]
        | PrimitiveAvailableInFormValues
      ? Type
      : IsEnumLike<U> extends true
        ? Type
        : readonly MainFormMutationStateValues<U, KeysWillKeepOrigin, TypesWillKeepOrigin, RetainOriginalStructure>[]
    : Type extends (infer U)[]
      ? Clean<U> extends
          | RetainOriginalStructure[number]
          | TypesWillKeepOrigin[number]
          | NativeInstances[number]
          | PrimitiveAvailableInFormValues
        ? Type
        : IsEnumLike<U> extends true
          ? Type
          : MainFormMutationStateValues<U, KeysWillKeepOrigin, TypesWillKeepOrigin, RetainOriginalStructure>[]
      : {
          [Key in keyof Type]: Key extends KeysWillKeepOrigin[number]
            ? Type[Key]
            : Type[Key] extends TypesWillKeepOrigin[number]
              ? MainFormMutationStateValues<Type[Key], KeysWillKeepOrigin, TypesWillKeepOrigin, RetainOriginalStructure>
              :
                  | MainFormMutationStateValues<
                      Type[Key],
                      KeysWillKeepOrigin,
                      TypesWillKeepOrigin,
                      RetainOriginalStructure
                    >
                  | undefined;
        };
