/**
 * Combines two or more arrays into a single array type.
 *
 * @template A - The type of the first array.
 * @template B - The type of the second array.
 * @param {A} source - The first array type.
 * @param {B} list - The second array type.
 * @returns {A extends any[] ? (B extends any[] ? [...A, ...B] : A) : never} - The resulting array type after concatenation.
 *
 * @example
 * ```typescript
 * type Case1 = Concat<[1, 2], [3, 4]>; // Result: [1, 2, 3, 4]
 * ```
 */
export type Concat<T1 extends any[], T2 extends any[]> = [...T1, ...T2]; // Ts 4.0 support
// type Cast<X, Y> = X extends Y ? X : Y;
// import { Cast } from "./Cast";
// import { Reverse } from "./Reverse";
// export type Concat<T1 extends any[], T2 extends any[]> = Reverse<Cast<Reverse<T1>, any>, T2>
