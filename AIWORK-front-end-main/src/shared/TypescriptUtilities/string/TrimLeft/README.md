# Overview

The `TrimLeft` type utility is designed for string types to remove whitespace from the start of a string type.

# Usage

To harness the `TrimLeft` type utility, provide it with a string type. The utility will then generate a new string type with the whitespace removed from the beginning.

```typescript
type ResultType = TrimLeft<String>;
```

# Examples

By employing the `TrimLeft` type utility, you can remove the leading spaces:

```typescript
type TrimmedString = TrimLeft<"  Hello World">;
// Result type: "Hello World"
```
