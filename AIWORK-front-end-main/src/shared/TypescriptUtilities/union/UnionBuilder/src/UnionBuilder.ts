/**
 * A utility interface to build a union type dynamically by chaining different types.
 * @example
 * declare const u: UnionBuilder
 * const result = u.add<string>().add<number>().add<boolean>().value; // Result is "string | number | boolean"
 */
export interface UnionBuilder<T = never> {
  add: <NewValue>() => UnionBuilder<T | NewValue>;
  value: T;
}
