# Overview

The `NonEmptyArray` type utility ensures that a given array type always contains at least one element.

# Usage

To use the `NonEmptyArray` type utility, define it with a specific type (like number, string, etc.). Once defined, any array assigned to this type must contain at least one element; otherwise, a type error will be thrown.

# Examples

```typescript
const case1: NonEmptyArray<number> = [1, 2]; // This is valid.
const case2: NonEmptyArray<number> = [1]; // This is also valid.
const case3: NonEmptyArray<number> = []; // Type error! Array must contain at least one element.
```
