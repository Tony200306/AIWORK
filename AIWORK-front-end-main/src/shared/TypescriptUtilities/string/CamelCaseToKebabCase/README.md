# Overview

The `CamelCaseToKebabCase` type utility is crafted for string types to transform a camelCase string type into its kebab-case counterpart.

# Usage

To harness the `CamelCaseToKebabCase` type utility, provide it with a string type in camelCase. The utility will then generate a new string type transformed into kebab-case.

```typescript
type ResultType = CamelCaseToKebabCase<String>;
```

# Examples

By employing the `CamelCaseToKebabCase` type utility, you can convert this string into its kebab-case format:

```typescript
type KebabString = CamelCaseToKebabCase<"helloWorldExample">;
// Result type: "hello-world-example"
```
