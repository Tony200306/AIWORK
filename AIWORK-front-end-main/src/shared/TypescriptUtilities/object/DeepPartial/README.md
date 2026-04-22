# Overview

The `DeepPartial` type utility is designed to recursively transform all properties of an object, including nested objects, into partial properties (`undefined`). Optionally, specific types within the object can be excluded from this transformation, preserving their original structure.

# Usage

To utilize the `DeepPartial` type utility, provide it with an object type. The utility will return a new type where every property, including those in nested objects, is optional (`undefined`). You can also specify types that should retain their original structure by passing them as a tuple in the second generic parameter.

```typescript
type ResultType = DeepPartial<OriginalType>;
type ResultTypeWithExclusions = DeepPartial<OriginalType, [RetainType]>;
```

# Examples

### Basic Usage

Consider an object type with nested properties:

```typescript
interface Detail {
  name: string;
  age: number;
}

interface UserProfile {
  id: number;
  details: Detail;
}

type PartialUserProfile = DeepPartial<UserProfile>;
// Resulting type:
// {
//   id?: number;
//   details?: {
//     name?: string;
//     age?: number;
//   };
// }
```

### Retaining Specific Types

You can exclude certain types from being transformed to partial by specifying them in the second generic parameter:

```typescript
interface Detail {
  name: string;
  age: number;
}

interface UserProfile {
  id: number;
  details: Detail;
}

// Retains the structure of the `details` property by specifying it in the second generic parameter.
type PartialUserProfileButRetainDetail = DeepPartial<UserProfile, [Detail]>;
// Resulting type:
// {
//   id?: number;
//   details?: Detail;
// }
```
