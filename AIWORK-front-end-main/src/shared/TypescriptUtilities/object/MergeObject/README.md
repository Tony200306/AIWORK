# Overview

`MergeObject` is a utility that fuses two object types, preserving the types of overlapping properties as unions. Unlike a simple overwrite merge, this utility combines the types of properties that exist in both object types, resulting in a union type for such properties.

# Usage

To utilize the `MergeObject` type utility, provide it with two object types you wish to merge. The utility will then generate a new object type that integrates properties from both input types.

```typescript
type ResultType = MergeObject<FirstObjectType, SecondObjectType>;
```

# Examples

By employing the `MergeObject` type utility, you can merge User and UserDetails:

```typescript
interface X {
  a: 1;
  b: number;
}
interface Y {
  a: 2;
  b: string;
  c: boolean;
}
type CombinedType = MergeObject<X, Y>;
// Result type:
// {
//     a: 1 | 2;
//     b: number | string;
//     c?: boolean;
// }
```
