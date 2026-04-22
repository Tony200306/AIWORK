# Overview

The `ToUndefinableKeys` type utility is designed to transform specified keys in an object type to include `undefined` in their types.

# Usage

To utilize the `ToUndefinableKeys` type utility, provide it with two generics:

1. An object type that has keys you want to modify.
2. The key (or keys) from the object type that you wish to convert to include `undefined`.
   The utility will then produce a new object type with the specified key(s) set to include `undefined`.

```typescript
type ResultType = ToUndefinableKeys<Object, UnionKey>;
```

# Examples

By employing the ToUndefinableKeys type utility and specifying the a and b keys, you can make the a and b properties include undefined:

```typescript
type Example = {
  a: string;
  b: number;
  c: boolean;
};

type UpdatedExample = ToUndefinableKeys<Example, "a" | "b">;
// Result type:
// {
//     c: boolean;
//     a: string | undefined;
//     b: number | undefined;
// }
```
