# Overview

`ToMutableKeys` is a utility crafted to transform specified readonly properties of an object type into mutable ones.

# Usage

To use the `ToMutableKeys` type utility, provide it with an object type and the set of keys you wish to make mutable. The utility will then generate a new object type where the specified properties are mutable.

```typescript
type ResultType = ToMutableKeys<ObjectType, "key1" | "key2">;
```

# Examples

By employing the `ToMutableKeys` type utility, you can make the name property mutable:

```typescript
type UserConfig = {
  readonly id: number;
  readonly name: string;
  age: number;
};
type MutableNameConfig = ToMutableKeys<UserConfig, "name">;
// Result type:
// {
//     readonly id: number;
//     name: string;
//     age: number;
// }
```
