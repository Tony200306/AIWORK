/**
 * Type utility to parse a string literal to an integer.
 * @example
 * type Result1 = ParseInt<"123">; // Result is 123
 * type Result2 = ParseInt<"abc">; // Result is never
 */
export type ParseInt<T extends string> = T extends `${infer Int extends number}` ? Int : never;
