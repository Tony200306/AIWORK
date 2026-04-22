# Overview

The `Primitive` type utility is tailored to represent the fundamental primitive types in TypeScript. Specifically, it encompasses `string`, `number`, `boolean`, `bigint`, `symbol`, `undefined`, and `null`.

# Usage

To utilize the Primitive type utility, you can reference it when defining types that need to represent or check against any of the specified primitive types:

```typescript
type ResultType = Primitive;
```

# Examples

Consider a function that accepts only the defined primitive types:

```typescript
function handlePrimitiveValues(input: Primitive) {
  // Handle the input here...
}

handlePrimitiveValues("text"); // Valid
handlePrimitiveValues(42); // Valid
handlePrimitiveValues(true); // Valid
handlePrimitiveValues(undefined); // Valid
handlePrimitiveValues(null); // Valid
handlePrimitiveValues(BigInt(10)); // Valid
handlePrimitiveValues(Symbol("description")); // Valid
handlePrimitiveValues({}); // Invalid - objects are not in the defined Primitive set
handlePrimitiveValues([]); // Invalid - arrays are not in the defined Primitive set
```
