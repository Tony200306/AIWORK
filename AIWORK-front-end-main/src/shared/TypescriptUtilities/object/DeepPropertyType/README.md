# Overview

`DeepPropertyType` is a utility designed to extract the type of a nested property from an object type, given a dot-separated path string.

# Usage

To utilize the `DeepPropertyType` type utility, provide it with an object type and a dot-separated path string pointing to the desired nested property. The utility will then yield the type of the specified nested property.

```typescript
type ResultType = DeepPropertyType<ObjectType, "path.to.nested.property">;
```

# Examples

By employing the `DeepPropertyType` type utility, you can extract the type of the connection property:

```typescript
type Configuration = {
  database: {
    connection: {
      host: string;
      port: number;
    };
    credentials: {
      username: string;
      password: string;
    };
  };
  server: {
    port: number;
  };
};
type ConnectionType = DeepPropertyType<Configuration, "database.connection">;
// Result type:
// {
//     host: string;
//     port: number;
// }
```
