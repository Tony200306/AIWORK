# Overview

The `Last` type utility specializes in extracting the type of the last element from a tuple.

# Usage

To employ the `Last` type utility, introduce it to a tuple type. The utility will then deduce and return the type of the tuple's last element.

```typescript
type ResultType = Last<List>;
```

# Examples

By invoking the `Last` type utility, you can discern the type of the concluding element:

```typescript
type LastElementType = Last<ExampleTuple>; // Result: string
```
