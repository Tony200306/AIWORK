# Overview

The `Trim` type utility is specifically designed for string types to remove whitespace from the start and end of a string type.

# Usage

To utilize the `Trim` type utility, provide it with a string type. The utility will then generate a new string type with the whitespace removed from both the beginning and end.

```typescript
type ResultType = Trim<String>;
```

# Examples

By applying the `Trim` type utility, you can remove the extra spaces:

```typescript
type TrimmedString = Trim<"  Hello World  ">;
// Result type: "Hello World"
```
