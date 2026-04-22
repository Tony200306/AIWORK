# Overview

The `UnionToIntersection` type utility transforms a union type into its intersection equivalent. Unions represent values that can be any one of several types, while intersections represent values that combine multiple types.

# Usage

To harness the `UnionToIntersection` type utility, provide it with a union type. The utility will then yield an intersection type that combines all the types from the provided union.

```typescript
type ResultType = UnionToIntersection<Union>;
```

# Examples

By employing the `UnionToIntersection` type utility, you can convert this union into an intersection:

```typescript
type IntersectionType = UnionToIntersection<{ name: string } | { age: number }>; // Result type: { name: string } & { age: number }
```
