# Overview

`FunctionDetail` is a utility designed to deconstruct a function type into its individual components, such as its parameters and return type.

# Usage

To harness the `FunctionDetail` type utility, provide it with a function type. The utility will then produce an object type detailing the function's parameters and return type.

```typescript
type ResultType = FunctionDetail<FunctionType>;
```

# Examples

By employing the `FunctionDetail` type utility, you can extract the details of the `ExampleFunction` type:

```typescript
type ExampleFunction = (id: number, name: string) => boolean;
type FunctionComponents = FunctionDetail<ExampleFunction>;
// Result type:
// {
//     parameters: [number, string];
//     returnType: boolean;
// }
```
