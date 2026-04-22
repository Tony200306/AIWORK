# Overview

The `Unshift` type utility is designed to simulate the addition of single element to the beginning of a tuple type, analogous to the array's unshift method but at the type level.

# Usage

To employ the Unshift type utility, provide it with a tuple type and the type of the element you wish to prepend. The utility will then return a new tuple type with the provided element added to the beginning.

```typescript
type ResultType = Unshift<List, NewItem>;
```

# Examples

By employing the `Unshift` type utility, you can prepend a number type to this tuple:

```typescript
type ExtendedTuple = Unshift<[string, boolean], number>; // Result type: [number, string, boolean]
```
