# Overview

The `DeepNonNullable` type utility is crafted to recursively transform all properties of an object, including nested objects, from nullable (`null` or `undefined`) to non-nullable. Optionally, specific types within the object can be excluded from this transformation, retaining their original nullable structure.

# Usage

To utilize the `DeepNonNullable` type utility, provide it with an object type that might have nullable properties. The utility will then return a new type where every property, including those in nested objects, is non-nullable. You can also specify types that should retain their original nullable structure by passing them as a tuple in the second generic parameter.

```typescript
type ResultType = DeepNonNullable<NullableType>;
type ResultTypeWithExclusions = DeepNonNullable<NullableType, [ExcludedType]>;
```

# Examples

### Basic Usage

Consider an object type with nested nullable properties:

```typescript
type NullableUserProfile = {
  id: number | null;
  details: {
    name: string | null;
    age?: number;
  } | null;
};

type NonNullableUserProfile = DeepNonNullable<NullableUserProfile>;
// Resulting type:
// {
//     id: number;
//     details: {
//         name: string;
//         age: number;
//     };
// }
```

### Retaining Specific Types

You can exclude certain types from being made non-nullable by specifying them in the second generic parameter:

```typescript
interface Detail {
  name: string | null;
  age?: number;
}

type NullableUserProfile = {
  id: number | null;
  details: Detail | null;
};

// Retains the structure of the `details` property by specifying it in the second generic parameter.
type NonNullableUserProfileButRetainDetail = DeepNonNullable<NullableUserProfile, [Detail]>;
// Resulting type:
// {
//     id: number;
//     details: Detail;
// }
```
