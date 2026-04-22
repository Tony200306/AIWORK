# Overview

The `DropFromHead` utility function provides an efficient way to remove a specified number of elements from the beginning (head) of an array.

# Usage

To utilize the `DropFromHead` function, supply it with an array and the number of elements you wish to drop from the head. The utility will create and return a new array, omitting the specified number of elements from the beginning of the provided array.

```typescript
type ResultType = DropFromHead<List>;
```

# Examples

To drop the first two elements from this tuple type, use the `DropFromHead` type utility:

```typescript
type Case1 = DropFromHead<[1, 2, 3, 4, 5], 2>; // [3, 4, 5]
```
