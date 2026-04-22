# Overview

`PathKeyOfObject` is a utility designed to extract the full path of keys from a nested object type as a union of string literal types.

# Usage

To harness the `PathKeyOfObject` type utility, provide it with an object type containing nested properties. The utility will return a union of string literals representing the full path to each property, even if nested.

```typescript
type ResultType = PathKeyOfObject<NestedObjectType>;
```

# Examples

By employing the `PathKeyOfObject` type utility, you can obtain the full path of keys:

```typescript
type Config = {
  database: {
    host: string;
    port: number;
    user: {
      username: string;
      password: string;
    };
  };
  server: {
    port: number;
  };
};
type ConfigPaths = PathKeyOfObject<Config>;
// Result type:
// "database.host" | "database.port" | "database.user.username" | "database.user.password" | "server.port"
```
