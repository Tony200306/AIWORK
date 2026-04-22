# Overview

`AppendArgument` is a sophisticated utility designed to augment a function type by appending an additional argument to its parameter list.

# Usage

To employ the `AppendArgument` type utility, supply it with a function type and the type of the argument you wish to append. The utility will then produce a new function type with the appended argument.

```typescript
type ResultType = AppendArgument<FunctionType, ArgumentType>;
```

# Examples

By utilizing the `AppendArgument` type utility, you can append a string argument to the InitialFunction type:

```typescript
type InitialFunction = (x: number, y: number) => void;
type ExtendedFunction = AppendArgument<InitialFunction, string>;
// Result type:
// (x: number, y: number, z: string) => void
```
