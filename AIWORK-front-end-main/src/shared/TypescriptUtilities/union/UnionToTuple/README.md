# Overview

The `UnionToTuple` type utility is adeptly crafted to convert a union type into its tuple representation.

# Usage

To employ the `UnionToTuple` type utility, provide it with a union type. The utility will then return a tuple type that represents the sequence of types from the given union.

```typescript
type ResultType = UnionToTuple<Union>;
```

# Examples

By applying the `UnionToTuple` type utility, you can represent this union as a tuple:

```typescript
type TupleType = UnionToTuple<string | number | boolean>; // Result type: [string, number, boolean]
```
