# Overview

The `ToRequiredKeys` type utility is designed to transform an optional key in an object type into a required key.

# Usage

To utilize the `ToRequiredKeys` type utility, provide it with two generics:

1. An object type that has both required and optional keys.
2. The key (or keys) from the object type that you wish to convert from optional to required.
   The utility will then produce a new object type with the specified key(s) set as required.

```typescript
type ResultType = ToRequiredKeys<Object, UnionKeyOptional>;
```

# Examples

By employing the ToRequiredKeys type utility and specifying the age key, you can make the age property required:

```typescript
type User = {
  id: number;
  name: string;
  age?: number;
};

type UpdatedUser = ToRequiredKeys<User, "age">;
// Result type:
// {
//     id: number;
//     name: string;
//     age: number;
// }
```
