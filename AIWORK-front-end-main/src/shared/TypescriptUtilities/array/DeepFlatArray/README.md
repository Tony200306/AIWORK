# Overview

The `DeepFlatArray` utility function is crafted to flatten deeply nested arrays, transforming them into a single-level array. Whether dealing with arrays that have multiple layers of nesting or just a few, this utility ensures a consistent and type-safe method to produce a flattened version of the input array.

# Usage

To take advantage of the `DeepFlatArray` function, provide it with an array that may contain nested arrays. The utility will traverse the array, identifying and flattening all nested structures, ultimately returning a single-level array containing all the elements from the original, nested array.

```typescript
type ResultType = DeepFlatArray<List>;
```

# Examples

The DeepFlatArray utility, you can flatten this array:

```typescript
type MyType = DeepFlatArray<[["a", "b"], ["c", "d"], ["e", ["f", ["g"], ["h"]]]], 10>;
// Result: ["a", "b", "c", "d", "e", "f", "g", "h"]
```
