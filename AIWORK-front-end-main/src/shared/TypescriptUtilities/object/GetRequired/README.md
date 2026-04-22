# Overview

`GetRequired` is a utility that extracts the required properties of an object type, returning an object type composed solely of its required properties.

# Usage

To employ the `GetRequired` type utility, provide it with the object type from which you wish to extract required properties. The utility will then produce an object type that encompasses only the required properties of the provided type.

```typescript
type ResultType = GetRequired<Object>;
```

# Examples

By utilizing the `GetRequired` type utility, you can extract the required properties from the UserProfile type:

```typescript
type UserProfile = {
  id: number;
  name: string;
  age?: number;
  email?: string;
};
type RequiredProps = GetRequired<UserProfile>;
// Result type:
// {
//     id: number;
//     name: string;
// }
```
