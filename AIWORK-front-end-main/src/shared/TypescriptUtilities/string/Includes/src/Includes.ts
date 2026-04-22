/**
 * Checks if a specific substring exists within a string type.
 *
 * @param {string} sourceString - The source string in which to search for the substring.
 * @param {string} searchString - The substring to search for within the source string.
 *
 * @example
 * ```typescript
 * type Case1 = Includes<"Lorem ipsum dolor sit", 'dolor sit'>;
 *
 * // Result:
 * // true
 * ```
 */
export type Includes<T extends string, U extends string> = T extends `${any}${U}${any}` ? true : false;
