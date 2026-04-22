// https://github.com/microsoft/TypeScript/pull/40336

import { PathKeyOfObject } from '../../PathKeyOfObject';

/**
 * Provides a type for a nested property in an object based on a dot-separated path string.
 *
 * @param {object} sourceObject - The source object from which the property value is to be extracted.
 * @param {string} path - The dot-separated path string pointing to the desired nested property.
 *
 * @example
 * ```typescript
 * type Configuration = {
 *   database: {
 *     connection: {
 *       host: string;
 *       port: number;
 *     };
 *     credentials: {
 *       username: string;
 *       password: string;
 *     };
 *   };
 *   server: {
 *     port: number;
 *   };
 * };
 *
 * type ConnectionType = DeepPropertyType<Configuration, 'database.connection'>;
 * // Result type:
 * // {
 * //   host: string;
 * //   port: number;
 * // }
 * ```
 */
export type DeepPropertyType<T, P extends PathKeyOfObject<T>> = P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? Rest extends PathKeyOfObject<T[Key]>
      ? DeepPropertyType<T[Key], Rest>
      : never
    : never
  : P extends keyof T
    ? T[P]
    : never;
