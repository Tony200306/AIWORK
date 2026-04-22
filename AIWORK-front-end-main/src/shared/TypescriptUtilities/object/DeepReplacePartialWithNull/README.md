# Overview

The `DeepReplacePartialWithNull` type utility is designed to recursively transform all properties of an object, including nested objects, from partial (`undefined`) to `null`. Optionally, specific types within the object can be excluded from this transformation, preserving their original partial structure.

# Usage

To utilize the `DeepReplacePartialWithNull` type utility, provide it with an object type that may contain partial properties. The utility will return a new type where every `undefined` property, including those in nested objects, is replaced with `null`. You can also specify types that should retain their original partial structure by passing them as a tuple in the second generic parameter.

```typescript
type ResultType = DeepReplacePartialWithNull<PartialType>;
type ResultTypeWithExclusions = DeepReplacePartialWithNull<PartialType, [RetainType]>;
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

type NullUserProfile = DeepReplacePartialWithNull<PartialUserProfile>;
// Resulting type:
// {
//   id: number | null;
//   details: {
//     name: string | null;
//     age: number | null;
//   } | null;
// }
```

### Retaining Specific Types

You can exclude certain types from being transformed from partial to null by specifying them in the second generic parameter:

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
type NullUserProfileButRetainDetail = DeepReplacePartialWithNull<PartialUserProfile, [Detail]>;
// Resulting type:
// {
//   id: number | null;
//   details: Detail | null;
// }
```
