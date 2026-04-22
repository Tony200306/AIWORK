# Overview

The `Head` type utility is adeptly crafted to extract the first element type from a tuple.

# Usage

To harness the `Head` type utility, supply it with a tuple type. The utility will then return the type of the tuple's first element.

```typescript
type ResultType = Head<List>;
```

# Examples

By using the Head type utility, you can extract the type of the first element:

```typescript
type FirstElementType = Head<[string, number, boolean]>; // Result: string
```
