# Overview

`MutableObject` is a utility that transforms all `readonly` properties of an object type into mutable ones. It is especially handy for scenarios where you need to modify properties that were originally defined as immutable, without altering the original type definition.

# Usage

To employ the `MutableObject` type utility, provide it with the object type containing `readonly` properties you wish to make mutable. The utility will then yield a new object type where all properties are mutable.

```typescript
type ResultType = MutableObject<OriginalObjectType>;
```

# Examples

By applying the `MutableObject` type utility, you can make all properties of the User type mutable:

```typescript
type User = {
  readonly id: number;
  readonly name: string;
  age: number;
};
type MutableUser = MutableObject<User>;
// Result type:
// {
//     id: number;
//     name: string;
//     age: number;
// }
```
