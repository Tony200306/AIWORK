import { IsRequired } from '../../../@essentials';

/**
 * Extracts the required properties of an object type, returning a new type composed solely of those properties.
 * This utility type filters out optional properties and includes only those that are required.
 *
 * @template T - The object type from which to extract required properties.
 *
 * @param {T} sourceObject - The source object type to analyze for required properties.
 *
 * @example
 * ```typescript
 * type Example = {
 *   a: string;
 *   b?: number;
 *   c: boolean;
 * };
 *
 * type Case1 = GetRequired<Example>;
 * // Result: { a: string; c: boolean }
 * ```
 */
export type GetRequired<T> = {
  [K in keyof T as IsRequired<T, K> extends true ? K : never]: T[K];
};
