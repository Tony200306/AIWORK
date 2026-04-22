/**
 * Transforms an array type into its corresponding union type.
 *
 * @template T - The array type whose elements will be converted into a union.
 * @param {T} list - The array type containing specific literals.
 * @returns {T extends (infer U)[] ? U : never} - The union type of the array elements.
 *
 * @example
 * ```typescript
 * type Case1 = ArrayToUnion<[0, 'data', 1, 'abc']>;
 * // Result: 0 | "data" | 1 | "abc"
 * ```
 */
export type ArrayToUnion<T> = T extends (infer U)[] ? U : never;
// export type ArrayToUnion<T extends any[]> = T[number];
