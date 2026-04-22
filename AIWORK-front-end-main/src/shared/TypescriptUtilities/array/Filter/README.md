# Overview

The `Filter` type utility refines array types by including specific desired types. Designed for precision, it aids in creating clearer type definitions by selecting members from a array that match the given condition.

# Usage

To harness the `Filter` type utility, provide it with a array type and a condition or type that you wish to filter out. The utility will then yield a new type, including the types that match the provided condition.

```typescript
type ResultType = Filter<List, FilterBy>;
```

# Examples

If you want to filter out null from this array, you can use the `Filter` type utility:

```typescript
type NonNullableValues = Filter<[string, number, boolean, null], null>; // Resulting type: [string, number, boolean]
```
