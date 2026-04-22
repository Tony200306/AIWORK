# Overview

This utility type examines a string literal and attempts to parse it into an integer type. If successful, it returns the parsed integer; otherwise, it returns the `never` type.

# Usage

To use the `ParseInt` type utility, provide a string literal as the type argument. It will attempt to parse the string and provide the resulting type.

```typescript
type Result1 = ParseInt<"123">; // Result is 123 (type: number)
type Result2 = ParseInt<"abc">; // Result is never (type: never)
```

# Examples

```typescript
type Result1 = ParseInt<"123">; // Result is 123 (type: number)
type Result2 = ParseInt<"abc">; // Result is never (type: never)
```
