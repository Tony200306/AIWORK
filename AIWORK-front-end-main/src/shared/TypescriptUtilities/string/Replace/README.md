# Overview

The `Replace` type utility is crafted for string to replace a specified substring with another within a string type.

# Usage

To harness the `Replace` type utility, provide it with a string type, the substring type you wish to replace, and the replacement substring type. The utility will then generate a new string type with the specified substitution.

```typescript
type ResultType = Replace<SourceString, SearchValue, TargetValue>;
```

# Examples

By employing the `Replace` type utility, you can replace the substring "World" with "TypeScript":

```typescript
type ModifiedString = Replace<"HelloWorld", "World", "TypeScript">;
// Result type: "HelloTypeScript"
```
