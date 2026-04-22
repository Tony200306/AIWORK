# Overview

The `ArrayToUnion` type utility transforms a array type into its corresponding union type.

# Usage

To use the `ArrayToUnion` utility, provide it with a type that contains an array of specific literals. The utility will process this array type and convert it into a corresponding union type, giving you a comprehensive set of allowed values for it.

```typescript
type ResultType = ArrayToUnion<List>;
```

# Examples

```typescript
type MyType = ArrayToUnion<[0, "data", 1, "abc"]>;
// Result: 0 | "data" | 1 | 'abc'
```
