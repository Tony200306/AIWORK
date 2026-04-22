# Overview

The `DeepUndefinable` type utility is designed to recursively transform all properties of an object, including nested objects, into undefinable properties (`undefined`). Optionally, specific types within the object can be excluded from this transformation, preserving their original defined structure.

# Usage

To utilize the `DeepUndefinable` type utility, provide it with an object type that may have defined properties. The utility will return a new type where every property, including those in nested objects, is undefinable. You can also specify types that should retain their original defined structure by passing them as a tuple in the second generic parameter.

```typescript
type ResultType = DeepUndefinable<DefinedType>;
type ResultTypeWithExclusions = DeepUndefinable<DefinedType, [RetainType]>;
```

# Examples

### Basic Usage

Consider an object type with nested defined properties:

```typescript
interface Detail {
  name: string;
  age: number;
}

interface DefinedUserProfile {
  id: number;
  details: Detail;
}

type UndefinableUserProfile = DeepUndefinable<DefinedUserProfile>;
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

You can exclude certain types from being transformed to undefinable by specifying them in the second generic parameter:

```typescript
interface Detail {
  name: string;
  age: number;
}

interface DefinedUserProfile {
  id: number;
  details: Detail;
}

// Retains the structure of the `details` property by specifying it in the second generic parameter.
type UndefinableUserProfileButRetainDetail = DeepUndefinable<DefinedUserProfile, [Detail]>;
// Resulting type:
// {
//   id: number | undefined;
//   details: Detail | undefined;
// }
```
