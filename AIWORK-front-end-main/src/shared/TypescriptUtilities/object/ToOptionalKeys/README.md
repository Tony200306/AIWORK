# Overview

`ToOptionalKeys` is a utility tailored to convert specified required properties of an object type into optional ones.

# Usage

To utilize the `ToOptionalKeys` type utility, provide it with an object type and the set of keys you wish to make optional. The utility will then produce a new object type where the specified properties are optional.

```typescript
type ResultType = ToOptionalKeys<ObjectType, "key1" | "key2">;
```

# Examples

By applying the `ToOptionalKeys` type utility, you can make the name property optional:

```typescript
type UserData = {
  id: number;
  name: string;
  age: number;
};
type UserWithOptionalName = ToOptionalKeys<UserData, "name">;
// Result type:
// {
//     id: number;
//     name?: string;
//     age: number;
// }
```
