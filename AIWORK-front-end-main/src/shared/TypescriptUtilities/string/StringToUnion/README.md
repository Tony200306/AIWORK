# Overview

The `StringToUnion` type utility is adeptly crafted to convert a string type into a union of its individual character types.

# Usage

To harness the `StringToUnion` type utility, provide it with a string type. The utility will then generate a union type composed of the individual character types of the provided string.

```typescript
type ResultType = StringToUnion<String>;
```

# Examples

By employing the `StringToUnion` type utility, you can convert this string into a union of its characters:

```typescript
type CharUnion = StringToUnion<"Hello">;
// Result type: "H" | "e" | "l" | "l" | "o"
```
