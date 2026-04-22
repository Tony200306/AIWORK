# Overview

The `DeepUnpartial` type utility is designed to recursively transform all properties of an object, including nested objects, from partial (`undefined`) to non-partial. Optionally, specific types within the object can be excluded from this transformation, preserving their original partial structure.

# Usage

To utilize the `DeepUnpartial` type utility, provide it with an object type that may have partial properties. The utility will return a new type where every property, including those in nested objects, is non-partial. You can also specify types that should retain their original partial structure by passing them as a tuple in the second generic parameter.

```typescript
type ResultType = DeepUnpartial<PartialType>;
type ResultTypeWithExclusions = DeepUnpartial<PartialType, [RetainType]>;
```

# Examples

### Basic Usage

Consider an object type with nested partial properties:

```typescript
interface Detail {
  name?: string;
  age?: number;
}

interface PartialUserProfile {
  id?: number;
  details?: Detail;
}

type NonPartialUserProfile = DeepUnpartial<PartialUserProfile>;
// Resulting type:
// {
//   id: number;
//   details: {
//     name: string;
//     age: number;
//   };
// }
```

### Retaining Specific Types

You can exclude certain types from being transformed to non-partial by specifying them in the second generic parameter:

```typescript
interface Detail {
  name?: string;
  age?: number;
}

interface PartialUserProfile {
  id?: number;
  details?: Detail;
}

// Retains the structure of the `details` property by specifying it in the second generic parameter.
type NonPartialUserProfileButRetainDetail = DeepUnpartial<PartialUserProfile, [Detail]>;
// Resulting type:
// {
//   id: number;
//   details: Detail;
// }
```
