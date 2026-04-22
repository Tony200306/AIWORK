# Overview

`MergeObjectB2A` is a utility that merges two object types, with the second object (B) taking precedence over the first object (A) for overlapping properties. This ensures that the properties of the second object overwrite those of the first object, while retaining unique properties from both.

# Usage

To use the `MergeObjectB2A` type utility, provide it with two object types you wish to merge, with the second object (B) being the overriding type. The utility will produce a new object type combining properties from both input types, with overlapping properties taking the type of the second object.

```typescript
type ResultType = MergeObjectB2A<PrimaryObjectType, SecondaryObjectType>;
```

# Examples

By employing the `MergeObjectB2A` type utility, you can merge A and B, with A being the primary:

```typescript
interface A {
  x: string;
  y: number;
}
interface B {
  x: boolean;
  z: string;
}
type MergedType = MergeObjectB2A<A, B>;
// Result type:
// {
//     x: boolean;
//     y: number;
//     z: string;
// }
```
