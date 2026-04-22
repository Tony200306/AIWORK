# Overview

The `Reverse` type utility is designed to reverse the order of elements within a tuple type.

# Usage

To leverage the `Reverse` type utility, supply it with a tuple type. The utility will then return a new tuple type with the order of elements reversed.

```typescript
type ResultType = Reverse<List>;
```

# Examples

By using the `Reverse` type utility, you can reverse the order of elements in this tuple:

```typescript
type ReversedTuple = Reverse<[number, string, boolean]>; // Result type: [boolean, string, number]
```
