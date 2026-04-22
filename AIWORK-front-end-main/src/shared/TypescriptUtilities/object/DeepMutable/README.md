# Overview

The `DeepMutable` type utility is designed to recursively transform all properties of an object, including nested objects, from `readonly` to mutable. Additionally, it allows you to exclude specific types within the object from this transformation, preserving their original structure.

# Usage

To utilize the `DeepMutable` type utility, provide it with the type that has `readonly` properties. The utility will return an object type where all properties, including those in nested objects, are mutable. You can also specify types that should be retained as `readonly` by passing them as a tuple in the second generic parameter.

```typescript
type ResultType = DeepMutable<ImmutableType>;
type ResultTypeWithExclusions = DeepMutable<ImmutableType, [ExcludedType]>;
```

# Examples

### Basic Usage

Consider an object type with nested `readonly` properties:

```typescript
type ImmutableUserProfile = {
  readonly id: number;
  readonly details: {
    readonly name: string;
    readonly age: number;
  };
};

type MutableUserProfile = DeepMutable<ImmutableUserProfile>;
// Result type:
// {
//     id: number;
//     details: {
//         name: string;
//         age: number;
//     };
// }
```

### Excluding Specific Types

You can exclude certain types from being made mutable by specifying them in the second generic parameter:

```typescript
interface Detail {
  readonly name: string;
  readonly age: number;
}

type ImmutableUserProfile = {
  readonly id: number;
  readonly details: Detail;
};

type MutableUserProfileButRetainDetail = DeepMutable<ImmutableUserProfile, [Detail]>;
// Result type:
// {
//     id: number;
//     details: Detail;
// }
```
