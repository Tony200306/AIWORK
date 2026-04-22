# Overview

`AnyRecord` is a type utility designed to represent an object where keys are strings and values can be of any type.

# Usage

Using the `AnyRecord` type utility is straightforward. When defining an object type where keys are strings and values can be of any type, use `AnyRecord`:

```typescript
type ResultType = AnyRecord;
```

# Examples

Consider representing a dynamic configuration object:

```typescript
const config: AnyRecord = {
  host: "localhost",
  port: 8080,
  options: { secure: true, retry: 3 },
};
```
