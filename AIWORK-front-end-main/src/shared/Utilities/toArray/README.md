# Overview

The `toArray` function is designed to ensure that its input, whether it's a single item or an array of items, is returned as an array.

# API

#### Parameters

- **items**: A single item or an array of items of type `T`. The input to be converted into an array.

#### Return value

- Returns an array of type `T[]`. If the input is already an array, it is returned as is. If the input is a single item, it is wrapped in an array.

# Usage

1. Wrapping a single element in an array

```typescript
const singleItem = "hello";
const arrayFromItem = toArray(singleItem);
console.log(arrayFromItem); // Output: ['hello']
```

2. Returning an array as is

```typescript
const arrayOfItems = ["hello", "world"];
const sameArray = toArray(arrayOfItems);
console.log(sameArray); // Output: ['hello', 'world']
```

3. Working with different data types

```typescript
const number = 42;
const object = { key: "value" };
const array = [number, object];

console.log(toArray(number)); // Output: [42]
console.log(toArray(object)); // Output: [{ key: 'value' }]
console.log(toArray(array)); // Output: [42, { key: 'value' }]
```
