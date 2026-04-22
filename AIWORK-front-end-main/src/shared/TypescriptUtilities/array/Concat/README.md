# Overview

The `Concat` utility function offers a robust solution for combining two or more arrays into a single array. Designed with performance and type-safety in mind, this utility ensures that arrays of various types can be concatenated seamlessly, producing a new array that maintains the order of the original arrays.

# Usage

To utilize the `Concat` function, provide it with two or more arrays that you intend to combine. The utility will process each array in the order they are provided and produce a new array containing all elements from the input arrays.

```typescript
type ResultType = Concat<List, OtherList>;
```

# Examples

By employing the Concat utility, you can merge these arrays:

```typescript
type Case1 = Concat<[1, 2], [3, 4]>; // Result: [1, 2, 3, 4]
```
