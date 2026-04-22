# Overview

`IsUnknown` is a diagnostic utility tailored to determine if a given type is the `unknown` type

# Usage

To employ the `IsUnknown` type utility, provide it with the type you want to inspect. The utility will then return `true` if the type is unknown and `false` otherwise.

```typescript
type ResultType = IsUnknown<TypeToCheck>;
```

# Examples

Consider checking the type of a variable:

```typescript
type AmbiguousType = unknown;
type CheckResult = IsUnknown<AmbiguousType>;
// Result type:
// true
```
