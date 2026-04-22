# Overview

The `BuiltIn` type utility is designed to represent all built-in types.

# Usage

To utilize the `BuiltIn` type utility, you can simply reference it when defining types that need to represent or check against any built-in type:

```typescript
type ResultType = BuiltIn;
```

# Examples

Consider a function that accepts only built-in types:

```typescript
function handleBuiltInTypes(input: BuiltIn) {}
handleBuiltInTypes("string"); // Valid
handleBuiltInTypes(123); // Valid
handleBuiltInTypes(true); // Valid
handleBuiltInTypes([]); // Invalid - arrays are not a built-in type in this context
handleBuiltInTypes({}); // Invalid - objects are not a built-in type in this context
```
