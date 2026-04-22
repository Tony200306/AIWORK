# Overview

`GetOptional` is a utility that extracts the optional properties of an object type, returning an object type composed solely of its optional properties.

# Usage

To utilize the `GetOptional` type utility, provide it with the object type from which you wish to extract optional properties. The utility will then produce an object type that includes only the optional properties of the provided type.

```typescript
type ResultType = GetKeyWithTypes<Object>;
```

# Examples

By applying the `GetOptional` type utility, you can extract the optional keys from the User type:

```typescript
type User = {
  id: number;
  name: string;
  age?: number;
  email?: string;
};
type OptionalProps = GetOptional<User>;
// Result type:
// {
//     age?: number;
//     email?: string;
// }
```
