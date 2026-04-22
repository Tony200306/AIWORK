import { IsAny } from '../../IsAny';

/**
 * Determines if a given type is the `unknown` type.
 *
 * @template T - The type to check.
 * @param {T} sourceType - The type to be checked.
 * @returns {boolean} `true` if `sourceType` is `unknown`, otherwise `false`.
 *
 * @example
 * ```typescript
 * type AmbiguousType = unknown;
 * type CheckResult = IsUnknown<AmbiguousType>;
 * // Result: true
 * ```
 */
export type IsUnknown<T> = IsAny<T> extends true ? false : unknown extends T ? true : false;
