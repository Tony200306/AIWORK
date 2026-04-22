# Overview

The `DeepReplaceNullWithUndefined` type utility is designed to recursively transform all properties of an object, including nested objects, from `null` to `undefined`. Optionally, specific types within the object can be excluded from this transformation, preserving their original `null` values.

# Usage

To utilize the `DeepReplaceNullWithUndefined` type utility, provide it with an object type that may contain `null` properties. The utility will return a new type where every `null` property, including those in nested objects, is replaced with `undefined`. You can also specify types that should retain their original `null` values by passing them as a tuple in the second generic parameter.

```typescript
type ResultType = DeepReplaceNullWithUndefined<NullableType>;
type ResultTypeWithExclusions = DeepReplaceNullWithUndefined<NullableType, [RetainType]>;
```

# Examples

### Basic Usage

Consider an object type with nested `null` properties:

```typescript
interface Detail {
  name: string | null;
  age: number | null;
}

interface NullableUserProfile {
  id: number | null;
  details: Detail;
}

type UndefinedUserProfile = DeepReplaceNullWithUndefined<NullableUserProfile>;
// Resulting type:
// {
//   id: number | undefined;
//   details: {
//     name: string | undefined;
//     age: number | undefined;
//   };
// }
```

### Retaining Specific Types

You can exclude certain types from being transformed from null to undefined by specifying them in the second generic parameter:

```typescript
interface Detail {
  name: string | null;
  age: number | null;
}

interface NullableUserProfile {
  id: number | null;
  details: Detail;
}

// Retains the structure of the `details` property by specifying it in the second generic parameter.
type UndefinedUserProfileButRetainDetail = DeepReplaceNullWithUndefined<NullableUserProfile, [Detail]>;
// Resulting type:
// {
//   id: number | undefined;
//   details: Detail;
// }
```
