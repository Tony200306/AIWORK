# Overview

The `Push` type utility is tailored to simulate the addition of an element to the end of a tuple type, much like the array's push method, but at the type level.

# Usage

To make use of the `Push` type utility, provide it with a tuple type and the type of the element you wish to add. The utility will then return a new tuple type with the provided element appended to the end.

```typescript
type ResultType = Push<List, Item>;
```

# Examples

By applying the `Push` type utility, you can append a boolean type to this tuple:

```typescript
type ExtendedTuple = Push<[number, string], boolean>; // Result type: [number, string, boolean]
```
