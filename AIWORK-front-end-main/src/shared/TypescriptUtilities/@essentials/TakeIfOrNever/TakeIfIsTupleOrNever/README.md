# Overview

`TakeIfIsTupleOrNever` is a specialized utility that evaluates a given type and returns the type if it's a tuple, or the `never` type otherwise.

# Usage

To leverage the `TakeIfIsTupleOrNever` type utility, provide it with the type you want to inspect. The utility will then return the type itself if it's a tuple, and `never` if it's not.

```typescript
type ResultType = TakeIfIsTupleOrNever<TypeToCheck>;
```

# Examples

Consider checking the type of two variables:

```typescript
type SomeTuple = [string, number];
type SomeArray = string[];

type TupleResult = TakeIfIsTupleOrNever<SomeTuple>; // Result type: [string, number]
type ArrayResult = TakeIfIsTupleOrNever<SomeArray>; // Result type: never
```
