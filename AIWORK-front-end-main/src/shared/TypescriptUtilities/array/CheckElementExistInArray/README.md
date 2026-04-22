# Overview

The `CheckElementExistInArray` utility function provides a straightforward way to verify the presence of an element within an array. Whether working with arrays of numbers, strings, or custom objects, this utility offers a fast and type-safe method to determine if a specific element exists in the array.

# Usage

To use the `CheckElementExistInArray` utility, provide it with an array and the element you wish to search for. The utility will examine the array, verifying the presence of the provided element, and return a boolean value indicating the result. If the element is found within the array, it will return true; otherwise, it will return false.

```typescript
type ResultType = CheckElementExistInArray<List, SearchItem>;
```

# Examples

By using the `CheckElementExistInArray` utility, you can check if a specific color exists in the array:

```typescript
const data = [1, 2, 3, 4, [4, 5, 6] as const] as const;
type Case1 = CheckElementExistInArray<typeof data, 1>; // true;
type Case2 = CheckElementExistInArray<typeof data, 6>; // false;
type Case3 = CheckElementExistInArray<typeof data, [4, 5, 6]>; // false
type Case4 = CheckElementExistInArray<typeof data, readonly [4, 5, 6]>; // true
```
