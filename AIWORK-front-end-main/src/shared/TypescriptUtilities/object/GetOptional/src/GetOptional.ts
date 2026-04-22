import { GetRequired } from '../../GetRequired';

/**
 * Extracts the keys from an object type that are marked as optional.
 * This utility helps identify which properties in an object type are not required.
 *
 * @template T - The object type from which to extract optional keys.
 *
 * @param {T} sourceObject - The source object type to analyze for optional keys.
 *
 * @example
 * ```typescript
 * type MyObject = {
 *   a: number;
 *   b?: number;
 *   c?: string;
 * };
 *
 * type Case1 = GetOptional<MyObject>;
 * // Result: { b?: number; c?: string; }
 * ```
 */
export type GetOptional<T> = Omit<T, keyof GetRequired<T>>;
