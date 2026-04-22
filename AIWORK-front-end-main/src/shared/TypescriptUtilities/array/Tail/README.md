# Overview

The `Tail` type utility is adeptly crafted to extract all elements of a tuple type, excluding the first element.

# Usage

To utilize the `Tail` type utility, provide it with a tuple type. The utility will then return a new tuple type that excludes the first element, representing the "tail" of the original tuple.

```typescript
type ResultType = Tail<List>;
```

# Examples

By applying the `Tail` type utility, you can obtain a tuple type without the first element:

```typescript
type TailOfSample = Tail<[string, number, boolean]>; // Result type: [number, boolean]
```
