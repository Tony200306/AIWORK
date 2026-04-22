/**
 * Determines if a given type is the `any` type.
 *
 * @template T - The type to check.
 * @param {T} sourceType - The type to be checked.
 * @returns {boolean} `true` if `sourceType` is `any`, otherwise `false`.
 *
 * @example
 * ```typescript
 * type UnconstrainedType = any;
 * type CheckResult = IsAny<UnconstrainedType>; // Result: true
 * ```
 */
export type IsAny<T> = 0 extends 1 & T ? true : false;
