# Overview

The `UnionBuilder` interface is a utility crafted to dynamically build a union type by sequentially adding different types.

# Usage

To utilize the `UnionBuilder` interface, follow this pattern:

```typescript
declare const u: UnionBuilder;
const result = u.add<string>().add<number>().add<boolean>().value; // Result is "string | number | boolean"
```

# Examples

```typescript
declare const u: UnionBuilder;
const result = u.add<string>().add<number>().add<boolean>().value; // Result is "string | number | boolean"
```
