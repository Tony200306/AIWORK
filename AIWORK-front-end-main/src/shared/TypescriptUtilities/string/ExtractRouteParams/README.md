# Overview

The `ExtractRouteParams` type utility is designed to extract route parameters from a given string pattern. This utility makes it easier to work with dynamic routes by providing a type representation of the route parameters.

# Usage

To use the ExtractRouteParams utility, provide it with a string pattern that represents your route. The utility will extract the route parameters and provide a type definition for them.

```typescript
type ResultType = ExtractRouteParams<YourRoutePattern>;
```

# Examples

Given a route pattern like '/posts/:postId/:commentId', the utility will generate a type that represents the dynamic parts of the route:

```typescript
type RouteParams = ExtractRouteParams<"/posts/:postId/:commentId/:test/:test2/:test3">;
// Results in:
// {
//   postId: string;
//   commentId: string;
//   test: string;
//   test2: string;
//   test3: string;
// }
```
