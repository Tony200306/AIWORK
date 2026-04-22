# Overview

`KeyOf` is a utility that provides a concise way to obtain the keys of an object type as a union of string literal types. It offers a simplified alternative to TypeScript's built-in keyof operator, streamlining type definitions and ensuring readability.

# Usage

To harness the `KeyOf` type utility, provide it with the object type from which you wish to extract its keys. The utility will then return a union of the keys of the provided object type.

```typescript
type ResultType = KeyOf<Object>;
```

# Examples

By employing the `KeyOf` type utility, you can obtain the keys of the Book type:

```typescript
type Book = {
  title: string;
  author: string;
  publishedYear: number;
};
type BookKeys = KeyOf<Book>;
// Result type: "title" | "author" | "publishedYear"
```
