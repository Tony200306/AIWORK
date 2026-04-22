# Overview

The `GetGeneric` type utility extracts the generic type from a type with a single generic parameter.

# Usage

To use the `GetGeneric` utility, provide it with a type that contains a single generic parameter. The utility will extract the generic type and give you a type definition for it.

```typescript
type ResultType = GetGeneric<AnyType>;
```

# Examples

```typescript
type MyType = MyGeneric<"GENERIC">; // 'GENERIC'
```
