# Overview

The `Includes` type utility is tailored for string types to check if a specific substring exists within a string type.

# Usage

To harness the `Includes` type utility, provide it with a string type and the substring type you wish to search for. The utility will then return a type indicating whether the provided substring type exists within the original string type.

```typescript
type ResultType = Includes<String>;
```

# Examples

By using the `Includes` type utility, you can check if the substring "World" is included in the original:

```typescript
type Result = Includes<"HelloWorld", "World">; // Result type: true
```
