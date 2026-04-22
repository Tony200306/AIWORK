# Overview

The `FlatArray` utility function is tailored to flatten arrays that contain one level of nested arrays. It simplifies arrays by merging the inner arrays into the outer array, resulting in a single-level array structure.

# Usage

To employ the `FlatArray` function, provide it with an array that may contain another array as its elements. The utility will then return a new single-level array by merging the inner arrays with the outer one.

```typescript
type ResultType = FlatArray<List>;
```

# Examples

By using the FlatArray utility, this array can be flattened:

```typescript
type ResultType = FlatArray<[1, [2, 3], 4, [5, 6], 7]>;
// Result [1, 2, 3, 4, 5, 6, 7]
```
