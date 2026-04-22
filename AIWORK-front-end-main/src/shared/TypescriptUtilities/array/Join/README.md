# Overview

The `Join` type utility is designed for tuple types to concatenate elements of a tuple into a single string type.

# Usage

To utilize the `Join` type utility, provide it with a tuple type and a delimiter type. The utility will then yield a string type formed by joining the tuple elements using the provided delimiter.

```typescript
type ResultType = Join<List, Delimiter>;
```

# Examples

By applying the Join type utility with a space (" ") delimiter, you can concatenate the tuple elements into a single string:

```typescript
type ConcatenatedString = Join<["Hello", "World"], " ">; // Result type: "Hello World"
```
