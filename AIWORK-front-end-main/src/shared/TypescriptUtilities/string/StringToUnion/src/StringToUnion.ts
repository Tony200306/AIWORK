/**
 * Converts a string type into a union of its individual character types.
 *
 * @param {string} sourceString - The source string to be converted into a union of its characters.
 *
 * @example
 * ```typescript
 * type Case1 = StringToUnion<"Hello">;
 *
 * // Result type:
 * // "H" | "e" | "l" | "l" | "o"
 * ```
 */
export type StringToUnion<T extends string> = T extends `${infer Character}${infer Rest}`
  ? Character | StringToUnion<Rest>
  : never;
