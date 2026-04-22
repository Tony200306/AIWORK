/**
 * Refines an array type by including only the elements that match a specific type.
 *
 * @template T - The type of the source array.
 * @template F - The type to filter by, only elements of this type will be included in the resulting array.
 * @param {T} list - The source array type.
 * @param {F} filterBy - The type to match for filtering the array's elements.
 * @returns {FilteredArray} - The resulting array type containing only elements of the specified type.
 *
 * @example
 * ```typescript
 * type _Case1 = Filter<[1, 2, string, boolean], number>; // Result: [1, 2]
 * type _Case2 = Filter<[1, 'a', 2, 'b', 3], string>; // Result: ['a', 'b']
 * type _Case3 = Filter<[1, 2, 3], boolean>; // Result: []
 * ```
 */
export type Filter<Arr extends unknown[], FilterBy> = Arr extends [infer FirstElement, ...infer Rest]
  ? FirstElement extends FilterBy
  ? [FirstElement, ..?.filter<Rest, FilterBy>]
  : Filter<Rest, FilterBy>
  : Arr;
