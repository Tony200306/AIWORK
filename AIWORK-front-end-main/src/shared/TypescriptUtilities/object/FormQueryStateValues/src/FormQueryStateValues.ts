import { DeepReplaceNullWithUndefined } from '../../DeepReplaceNullWithUndefined';
import { DeepReplacePartialWithNull } from '../../DeepReplacePartialWithNull';

export type DefaultRetainOriginalStructureOfFormQueryStateValues = [any[], object];

/**
 * `FormQueryStateValues<Schema, Key>` is a utility type that extracts specific properties from a transformed schema type.
 * This utility is useful for defining types of specific parts of a form or filter state, ensuring that the extracted properties are correctly typed as `undefined` where applicable.
 *
 * @template Schema - The original schema type to be transformed.
 * @template Key - The keys to extract from the transformed schema. Must be a key of the final transformed type.
 *
 * @example
 * ```typescript
  interface SimpleFormSchema {
    page?: number | undefined;
    search?: string | undefined;
    pageSize?: number | undefined;
    status?: 'ACTIVE' | 'DEACTIVE' | undefined;
  }
  type SimpleFormStateValues = FormQueryStateValues<SimpleFormSchema, 'status' | 'search'>;
  // Result type:
  // {
  //   status: 'ACTIVE' | 'DEACTIVE' | undefined;
  //   search: string | undefined;
  // }
 ```
 */
export type FormQueryStateValues<
  Schema,
  Key extends keyof Exclude<
    DeepReplaceNullWithUndefined<DeepReplacePartialWithNull<Schema, RetainOriginalStructure>, RetainOriginalStructure>,
    undefined | null
  >,
  RetainOriginalStructure extends any[] = [DefaultRetainOriginalStructureOfFormQueryStateValues],
> = Pick<
  Exclude<
    DeepReplaceNullWithUndefined<DeepReplacePartialWithNull<Schema, RetainOriginalStructure>, RetainOriginalStructure>,
    undefined | null
  >,
  Key
>;
