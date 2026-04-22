# Overview

The `MutableArray` type utility is designed to convert read-only arrays (`readonly T[]`) to mutable ones.
In scenarios where array immutability is imposed but needs to be overridden for specific operations, this utility proves invaluable.
By providing a way to remove the `readonly` modifier from array types, it ensures flexibility in array manipulations while maintaining type safety.

# Usage

To employ the `MutableArray` type utility, provide it with a read-only array type.
The utility will then return a new array type with the `readonly` modifier removed, allowing modifications to the array's contents.

```typescript
type ResultType = MutableArray<List>;
```

# Examples

By using the `MutableArray` type utility, you can convert it to a mutable array type:

```typescript
type Case1: MutableArray<readonly [1, 2, 3, 4]> = [1, 2, 3, 4]; // Result: [1, 2, 3, 4]
```
