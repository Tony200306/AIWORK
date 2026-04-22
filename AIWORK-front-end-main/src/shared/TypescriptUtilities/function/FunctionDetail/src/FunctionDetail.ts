// export type FunctionDetail<F extends Function> = F extends (...args: infer Params) => infer ReturnType
//   ? [Params, ReturnType]
//   : never;

/**
 * Deconstructs a function type into its individual components, including its parameter types and return type.
 *
 * @template F - The function type to be deconstructed.
 * @param {F} sourceFunction - The source function type to be analyzed.
 * @returns {FunctionComponents} - An object type containing the parameters and return type of the function.
 *
 * @example
 * ```typescript
 * type ExampleFunction = (x: number, y: string) => boolean;
 * type FunctionComponents = FunctionDetail<ExampleFunction>;
 * // Result: {
 * //   parameters: [number, string];
 * //   returnType: boolean;
 * // }
 * ```
 */
export type FunctionDetail<F extends Function> = F extends (...args: infer A) => infer R
  ? { params: A; returnType: R }
  : never;
