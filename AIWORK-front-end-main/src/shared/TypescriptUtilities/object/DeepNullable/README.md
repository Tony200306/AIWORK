# Overview

The `DeepNullable` type utility is designed to recursively transform all properties of an object, including nested objects, into nullable properties (`null` or `undefined`). Optionally, specific types within the object can be excluded from this transformation, preserving their original non-nullable structure.

# Usage

To utilize the `DeepNullable` type utility, provide it with an object type that may have non-nullable properties. The utility will return a new type where every property, including those in nested objects, is nullable. You can also specify types that should retain their original non-nullable structure by passing them as a tuple in the second generic parameter.

```typescript
type ResultType = DeepNullable<NonNullableType>;
type ResultTypeWithExclusions = DeepNullable<NonNullableType, [RetainType]>;
```

# Examples

### Basic Usage

Consider an object type with nested non-nullable properties:

```typescript
interface Detail {
  name: string;
  age: number;
}

interface UserProfile {
  id: number;
  details: Detail;
}

type NullableUserProfile = DeepNullable<UserProfile>;
// Resulting type:
// {
//   id: number | null;
//   details: {
//     name: string | null;
//     age: number | null;
//   };
// }
```

### Retaining Specific Types

You can exclude certain types from being made nullable by specifying them in the second generic parameter:

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
type NullableUserProfileButRetainDetail = DeepNullable<UserProfile, [Detail]>;
// Resulting type:
// {
//   id: number | null;
//   details: Detail | null;
// }
```
