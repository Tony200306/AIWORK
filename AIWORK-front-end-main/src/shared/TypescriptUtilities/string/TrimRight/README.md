# Overview

The `TrimRight` type utility is crafted for string types to eliminate whitespace from the end of a string type.

# Usage

To employ the `TrimRight` type utility, provide it with a string type. The utility will then produce a new string type with the whitespace removed from the end.

```typescript
type ResultType = TrimRight<String>;
```

# Examples

By utilizing the `TrimRight` type utility, you can remove the trailing spaces:

```typescript
type TrimmedString = TrimRight<"Hello World  ">;
// Result type: "Hello World"
```
