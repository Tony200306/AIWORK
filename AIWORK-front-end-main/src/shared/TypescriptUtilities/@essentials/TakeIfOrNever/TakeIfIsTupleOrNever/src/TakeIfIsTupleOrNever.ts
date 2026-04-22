/**
 * Evaluates a given type and returns the type if it's a tuple, or `never` otherwise.
 *
 * @template T - The type to evaluate.
 * @param {T} sourceType - The type to be checked.
 * @returns {T extends any[] ? (number extends T['length'] ? never : T) : never} - The tuple type if `sourceType` is a tuple, or `never` if it is not.
 *
 * @example
 * ```typescript
 * type SomeTuple = [string, number];
 * type SomeArray = string[];
 *
 * type TupleResult = TakeIfIsTupleOrNever<SomeTuple>;  // Result: [string, number]
 * type ArrayResult = TakeIfIsTupleOrNever<SomeArray>;  // Result: never
 * ```
 */
export type TakeIfIsTupleOrNever<T> = T extends any[] ? (any[] extends T ? never : T) : never;
