# Overview

`ToReadonlyKeys` is a specialized utility crafted to transform specified mutable properties of an object type into readonly ones.

# Usage

To leverage the `ToReadonlyKeys` type utility, supply it with an object type and the set of keys you wish to mark as readonly. The utility will then generate a new object type where the specified properties are immutable.

```typescript
type ResultType = ToReadonlyKeys<ObjectType, "key1" | "key2">;
```

# Examples

By applying the `ToReadonlyKeys` type utility, you can make the name property optional:

```typescript
type ProductDetails = {
  id: number;
  name: string;
  price: number;
};
type ProductWithReadonlyPrice = ToReadonlyKeys<ProductDetails, "price">;
// Result type:
// {
//   id: number;
//   name: string;
//   readonly price: number;
// }
```
