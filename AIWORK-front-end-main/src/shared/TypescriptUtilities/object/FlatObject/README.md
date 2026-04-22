# Overview

`FlatObject` is a utility that transforms an object with nested properties into a single-depth object. Nested keys are represented at the top level, ensuring a flat structure without concatenating the keys.

# Usage

To harness the `FlatObject` type utility, provide it with an object type that has nested properties. The utility will then yield a new object type where nested objects are flattened to the top level.

```typescript
type ResultType = FlatObject<Object>;
```

# Examples

By applying the FlatObject type utility, you can flatten the NestedUser type:

```typescript
type NestedUser = {
  id: number;
  details: {
    name: string;
    age: number;
    address: {
      city: string;
      zip: number;
    };
  };
};

type FlattenedUser = FlatObject<NestedUser>;
// Result type:
// {
//     id: number;
//     "name": string;
//     "age": number;
//     "city": string;
//     "zip": number;
// }
```
