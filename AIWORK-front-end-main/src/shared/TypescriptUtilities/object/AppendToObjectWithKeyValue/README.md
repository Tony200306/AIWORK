# Overview

The `AppendToObjectWithKeyValue` type utility allows for the dynamic addition of a key-value pair to a given object type.

# Usage

To harness the `AppendToObjectWithKeyValue` type utility, furnish it with three generics:

1. The original object type you wish to augment.
2. The key (as a string literal type) you aim to incorporate.
3. The type of the value associated with the key.
   The utility will then yield a new object type inclusive of the specified key-value pair.

```typescript
type ResultType = AppendToObjectWithKeyValue<Object, Key, Value>;
```

# Examples

By applying the `AppendToObjectWithKeyValue` type utility and specifying the key age with the value type number, you can refine the User type:

```typescript
type User = {
  id: number;
  name: string;
};
type UpdatedUser = AppendToObjectWithKeyValue<User, "age", number>;
// Result type:
// {
//     id: number;
//     name: string;
//     age: number;
// }
```
