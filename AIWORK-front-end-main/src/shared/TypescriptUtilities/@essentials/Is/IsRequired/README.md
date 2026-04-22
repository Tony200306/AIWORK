# Overview

`IsRequired` is a diagnostic utility crafted to determine if a given property within an object type is required.

# Usage

To leverage the `IsRequired` type utility, provide it with an object type and the key (property name) you wish to inspect. The utility will then return `true` if the property is required and `false` otherwise.

```typescript
type ResultType = IsRequired<ObjectType, "propertyName">;
```

# Examples

By employing the IsRequired type utility, you can verify if the name property is required:

```typescript
type UserProfile = {
  id: number;
  name?: string;
  age: number;
};
type IsNameRequired = IsRequired<UserProfile, "name">;
// Result type: false
```
