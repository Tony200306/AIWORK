import { DeepMutable } from '../../DeepMutable';

type IsFullyWritable<T extends object> = IsEqualConsideringWritability<
  { [Q in keyof T]: T[Q] },
  DeepMutable<{ [Q in keyof T]: T[Q] }>
>;
type IsEqualConsideringWritability<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;

/**
 * Extracts the keys from an object type that are marked as readonly.
 * This utility identifies which properties in an object type are immutable.
 *
 * @template T - The object type from which to extract readonly keys.
 *
 * @param {T} sourceObject - The source object type to analyze for readonly keys.
 *
 * @example
 * ```typescript
 * type Example = {
 *   readonly a: number;
 *   b: string;
 *   readonly c?: string;
 * };
 *
 * type Case1 = GetReadonlyKeys<Example>;
 * // Result: "a" | "c"
 * ```
 */
export type GetReadonlyKeys<T extends object> = {
  [P in keyof T]-?: IsFullyWritable<Pick<T, P>> extends true ? never : P;
}[keyof T];
