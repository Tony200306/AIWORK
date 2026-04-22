# Overview

The `Length` type utility is engineered to determine the number of elements in a tuple type.

# Usage

To make use of the `Length` type utility, introduce it to a tuple type. The utility will then evaluate and return a type representing the count of elements in the provided tuple.

```typescript
type ResultType = Length<List>;
```

# Examples

By applying the `Length` type utility, you can ascertain the count of elements in the tuple:

```typescript
type TupleLength = Length<[boolean, string, number, string]>; // Result: 4
```
