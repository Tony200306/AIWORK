# Overview

The `Split` type utility is designed string types to divide a string type into a tuple of substrings based on a specified delimiter.

# Usage

To employ the `Split` type utility, provide it with a string type and a delimiter type. The utility will then yield a tuple type composed of substrings, separated by the given delimiter.

```typescript
type ResultType = Replace<SourceString, Separator>;
```

# Examples

By using the `Split` type utility with a comma (",") delimiter, you can divide the string into a tuple of substrings:

```typescript
type SplitTuple = Split<"Hello,World,TypeScript", ",">;
// Result type: ["Hello", "World", "TypeScript"]
```
