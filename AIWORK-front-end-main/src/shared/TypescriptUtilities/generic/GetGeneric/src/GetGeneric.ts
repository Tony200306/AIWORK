// https://dev.to/macsikora/advanced-typescript-exercises-answer-1-59ge

type Transform<A> = A extends Promise<infer Inner> ? Inner : never;

/**
 * Extracts the generic type from a type that has a single generic parameter.
 *
 * @template T - The type containing a single generic parameter.
 * @param {T} generic - The type from which the generic parameter will be extracted.
 * @returns {ExtractedType} - The extracted generic type.
 *
 * @example
 * ```typescript
 * type MyGeneric<T> = T;
 * type MyType = MyGeneric<'GENERIC'>;
 * type ExtractedType = GetGeneric<MyType>; // "GENERIC"
 * ```
 */
export type GetGeneric<T> = Transform<Promise<T>>;
