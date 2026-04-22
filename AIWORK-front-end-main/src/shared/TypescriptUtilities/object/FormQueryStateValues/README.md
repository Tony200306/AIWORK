# Overview

The `FormQueryStateValues` utility type is used to extract specific properties from a schema type after applying transformations. This is helpful when working with forms or filters where only a subset of properties needs to be managed, and you want to ensure that the properties are correctly typed, especially handling `undefined` values.

# Type Parameters

- **`Schema`**: The original schema type to be transformed.
- **`Key`**: The keys to extract from the transformed schema. Must be a key of the final transformed type.

# Usage

To use `FormQueryStateValues`, provide it with the schema type and specify the keys you want to extract. The resulting type will include only the specified properties, correctly typed with `undefined` where applicable.

# Examples

Here is an example demonstrating how `FormQueryStateValues` works:

```typescript
interface SimpleFormSchema {
  page?: number | undefined;
  search?: string | undefined;
  pageSize?: number | undefined;
  status?: "ACTIVE" | "DEACTIVE" | undefined;
}

type SimpleFormStateValues = FormQueryStateValues<SimpleFormSchema, "status" | "search">;
// Resulting type:
// {
//   status: 'ACTIVE' | 'DEACTIVE' | undefined;
//   search: string | undefined;
// }
```
