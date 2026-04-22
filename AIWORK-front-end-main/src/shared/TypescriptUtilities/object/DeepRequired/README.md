# Overview

The `DeepRequired` type utility is designed to recursively transform all properties of an object, including nested objects, into required properties. Optionally, specific types within the object can be excluded from this transformation, preserving their original optional structure.

# Usage

To utilize the `DeepRequired` type utility, provide it with an object type that may have optional properties. The utility will return a new type where every property, including those in nested objects, is required. You can also specify types that should retain their original optional structure by passing them as a tuple in the second generic parameter.

```typescript
type ResultType = DeepRequired<PartialType>;
type ResultTypeWithExclusions = DeepRequired<PartialType, [RetainType]>;
```

# Examples

### Basic Usage

Consider an object type with nested optional properties:

```typescript
interface Detail {
  name?: string;
  age?: number;
}

interface PartialUserProfile {
  id?: number;
  details?: Detail;
}

type RequiredUserProfile = DeepRequired<PartialUserProfile>;
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

You can exclude certain types from being transformed to required by specifying them in the second generic parameter:

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
type RequiredUserProfileButRetainDetail = DeepRequired<PartialUserProfile, [Detail]>;
// Resulting type:
// {
//   id: number;
//   details: Detail;
// }
```
