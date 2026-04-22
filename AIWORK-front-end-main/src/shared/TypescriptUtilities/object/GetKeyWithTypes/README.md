# Overview

`GetKeyWithTypes` is a utility that extracts the keys from an object type whose values match a specified type. It aids in identifying and working with specific properties of an object based on their type.

# Usage

To employ the `GetKeyWithTypes` type utility, provide it with two generics:

1. The object type from which you want to extract keys.
2. The type of the values you're targeting.
   The utility will then yield a union of keys from the object whose values match the specified type.

```typescript
type ResultType = GetKeyWithTypes<Object>;
```

# Examples

By using the `GetKeyWithTypes` type utility and targeting the `string` type, you can extract the keys with values of type `string`:

```typescript
type UserProfile = {
  username: string;
  age: number;
  email: string;
  registeredOn: Date;
};

type StringKeys = GetKeyWithTypes<UserProfile, string>;
// Result type: "username" | "email"
```
