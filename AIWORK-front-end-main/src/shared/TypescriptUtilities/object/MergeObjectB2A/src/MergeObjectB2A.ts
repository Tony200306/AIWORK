/**
 * Merges two object types, with the second object (B) taking precedence over the first object (A) for overlapping properties.
 *
 * @param {object} firstObject - The first object (A) whose properties will be overridden by the second object (B) where they overlap.
 * @param {object} secondObject - The second object (B) whose properties will take precedence in case of overlap with the first object (A).
 *
 * @example
 * ```typescript
 * interface A {
 *   x: string;
 *   y: number;
 * }
 *
 * interface B {
 *   x: boolean;
 *   z: string;
 * }
 *
 * type MergedType = MergeObjectB2A<A, B>;
 *
 * // Result type:
 * // {
 * //   x: boolean;
 * //   y: number;
 * //   z: string;
 * // }
 * ```
 */
export type MergeObjectB2A<A extends object, B extends object> = Omit<A, keyof B> & B;
