# Overview

Like `ArrayToUnion` but can use with deep array without flat, `DeepArrayToUnion` type utility transforms a nested array type into its corresponding union type.

# Usage

To use the `DeepArrayToUnion` utility, provide it with a type that contains an nested array of specific literals. The utility will process this array type and convert it into a corresponding union type, giving you a comprehensive set of allowed values for it.

```typescript
type ResultType = DeepArrayToUnion<List>;
```

# Examples

```typescript
type MyType = DeepArrayToUnion<[1, 2, [3, 4]]>;
// Result:  2 | 3 | 4 | 1
```
