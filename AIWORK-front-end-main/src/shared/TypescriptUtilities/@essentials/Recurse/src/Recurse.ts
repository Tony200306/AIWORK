type _Recurse<T> = T extends { __rec: never }
  ? never
  : T extends { __rec: { __rec: infer U } }
    ? { __rec: _Recurse<U> }
    : T extends { __rec: infer U }
      ? U
      : T;

/**
 * A cheat to bypass the "Type instantiation is excessively deep or possibly infinite" error.
 *
 * This approach uses recursion and type manipulation to handle deep or infinite type instantiation issues.
 *
 * @example
 * ```typescript
 * // Helper type to split a string by a delimiter using recursion
 * type _Split<S extends string, D extends string, A extends any[] = []> = S extends `${infer T}${D}${infer U}`
 *   ? { __rec: _Split<U, D, Push<A, T>> }
 *   : A;
 *
 * // Wrapper type to limit recursion depth
 * type Split<S extends string, D extends string> = Recurse<_Split<S, D>>;
 *
 * // Example usage
 * type Case1 = Split<"very long string ...", ' '>; // OK
 *
 * // Another approach without recursion depth limit
 * type Split<S extends string, D extends string, A extends any[] = []> = S extends `${infer T}${D}${infer U}`
 *   ? { __rec: Split<U, D, Push<A, T>> }
 *   : A;
 *
 * // This will result in an error due to excessive recursion depth
 * type Case2 = Split<"very long string ...", ' '>; // Error: Type instantiation is excessively deep or possibly infinite.
 * ```
 */
export type Recurse<T> = T extends { __rec: unknown } ? Recurse<_Recurse<T>> : T;

type Repeat<T, N extends number> = Recurse<_Repeat<T, N, []>>;
type _Repeat<T, N extends number, A extends T[]> = A['length'] extends N ? A : { __rec: _Repeat<T, N, [T, ...A]> };

// XS = ["x", ..., "x"] and XS["length"] = 100
type _XS = Repeat<'x', 100>;

//https://dev.to/susisu/how-to-create-deep-recursive-types-5fgg#:~:text=As%20of%20TypeScript%204.1%2C%20the,think%20this%20is%20too%20strict
