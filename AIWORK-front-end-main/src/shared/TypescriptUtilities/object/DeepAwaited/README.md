# Overview

The `DeepAwaited` type utility is designed to recursively transform all properties of an object, including nested objects, by awaiting any promises they may contain. It effectively resolves all promises within a structure, returning an object where all properties are fully resolved values.

# Usage

To utilize the `DeepAwaited` type utility, provide it with a type that might contain promises at any depth. The utility will return a type where all promises are awaited, and the resulting type contains the resolved values.

```typescript
type ResolvedType = DeepAwaited<OriginalType>;
```

# Examples

```typescript
type NestedPromises = {
  a: Promise<string>;
  b: {
    c: Promise<number>;
    d: {
      e: Promise<boolean>;
    };
  };
};

type ResolvedNestedPromises = DeepAwaited<NestedPromises>;
// Resulting type:
// {
//   a: string;
//   b: {
//     c: number;
//     d: {
//       e: boolean;
//     };
//   };
// }
```
