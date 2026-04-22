# Overview

The `LiteralUnion` create a union type by combining primitive types and literal types without sacrificing auto-completion in IDEs for the literal type part of the union.

# Usage

```typescript
type ResultType = LiteralUnion<Union, string>;
```

# Examples

```typescript
type Pet2 = LiteralUnion<"dog" | "cat", string>;
const pet: Pet2 = "";
// You **will** get auto-completion for `dog` and `cat` literals.
```
