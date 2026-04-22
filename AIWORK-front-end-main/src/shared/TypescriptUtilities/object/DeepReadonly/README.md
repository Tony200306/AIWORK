# Overview

The `DeepReadonly` type utility is designed to recursively transform all properties of an object, including nested objects, into readonly properties. Optionally, specific types within the object can be excluded from this transformation, preserving their original mutable structure.

# Usage

To utilize the `DeepReadonly` type utility, provide it with an object type. The utility will return a new type where every property, including those in nested objects, is readonly. You can also specify types that should retain their original mutable structure by passing them as a tuple in the second generic parameter.

```typescript
type ResultType = DeepReadonly<MutableType>;
type ResultTypeWithExclusions = DeepReadonly<MutableType, [RetainType]>;
```

# Examples

### Basic Usage

Consider an object type with nested mutable properties:

```typescript
interface Detail {
  name: string;
  age: number;
}

interface MutableUserProfile {
  id: number;
  details: Detail;
}

type ReadonlyUserProfile = DeepReadonly<MutableUserProfile>;
// Resulting type:
// {
//   readonly id: number;
//   readonly details: {
//     readonly name: string;
//     readonly age: number;
//   };
// }
```

### Retaining Specific Types

You can exclude certain types from being transformed to readonly by specifying them in the second generic parameter:

```typescript
interface Detail {
  name: string;
  age: number;
}

interface MutableUserProfile {
  id: number;
  details: Detail;
}

// Retains the structure of the `details` property by specifying it in the second generic parameter.
type ReadonlyUserProfileButRetainDetail = DeepReadonly<MutableUserProfile, [Detail]>;
// Resulting type:
// {
//   readonly id: number;
//   readonly details: Detail;
// }
```
