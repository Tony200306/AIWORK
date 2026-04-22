/**
 * Appends an additional argument to the parameter list of a function type.
 *
 * @template F - The original function type.
 * @template A - The type of the argument to be appended.
 * @param {F} sourceFunction - The source function type to which the new argument will be added.
 * @param {A} argType - The type of the argument to be appended to the source function.
 * @returns {ExtendedFunction} - The resulting function type with the new argument added to its parameter list.
 *
 * @example
 * ```typescript
 * type InitialFunction = (x: number, y: number) => void;
 * type ExtendedFunction = AppendArgument<InitialFunction, string>;
 * // Result: (x: number, y: number, z: string) => void
 * ```
 */
export type AppendArgument<Fn, ArgType> = Fn extends (...args: infer T) => infer R
  ? (...args: [...T, ArgType]) => R
  : never;
