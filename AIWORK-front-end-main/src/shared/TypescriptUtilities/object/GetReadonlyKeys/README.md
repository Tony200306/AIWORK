# Overview

`GetReadonlyKeys` is a utility that identifies and extracts the keys from an object type that are marked as readonly. This tool assists in pinpointing properties that are immutable, ensuring accurate type annotations and validations.

# Usage

To harness the `GetReadonlyKeys` type utility, supply it with the object type from which you want to extract `readonly` keys. The utility will then return a union of keys that are marked as `readonly` within the provided object type.

```typescript
type ResultType = GetReadonlyKeys<Object>;
```

# Examples

By employing the `GetReadonlyKeys` type utility, you can identify the readonly keys from the UserInfo type:

```typescript
type UserInfo = {
  readonly userID: number;
  readonly username: string;
  age: number;
  email: string;
};
type ReadonlyProps = GetReadonlyKeys<UserInfo>;
// Result type: "userID" | "username"
```
