// type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;

/**
 * Recursively transforms all properties of an object, including nested objects, to their resolved type if they are Promises.
 * This type utility will deeply await all promises within the object, returning the fully resolved structure.
 *
 * @template T - The object or value type that might contain Promises.
 *
 * @example
 * ```typescript
 * type ExampleType = {
 *   a: Promise<string>;
 *   b: {
 *     c: Promise<number>;
 *     d: {
 *       e: Promise<boolean>;
 *     };
 *   };
 * };
 *
 * // The DeepAwaited type will resolve all promises within the structure:
 * type ResolvedType = DeepAwaited<ExampleType>;
 * // Resulting type:
 * // {
 * //   a: string;
 * //   b: {
 * //     c: number;
 * //     d: {
 * //       e: boolean;
 * //     };
 * //   };
 * // }
 * ```
 */
export type DeepAwaited<T> = T extends object
  ? {
      [K in keyof T]: DeepAwaited<Awaited<T[K]>>;
    }
  : Awaited<T>;
