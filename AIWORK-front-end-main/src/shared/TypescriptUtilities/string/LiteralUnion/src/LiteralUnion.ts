import { Primitive } from '../../../@essentials';

/**
 * Allows creating a union type by combining primitive types and literal types without sacrificing auto-completion in IDEs for the literal type part of the union.
 *
 * Currently, when a union type of a primitive type is combined with literal types, TypeScript loses information about the combined literals. Consequently, IDEs with autocompletion do not suggest the declared literals.
 *
 * This type is a workaround for [Microsoft/TypeScript#29729](https://github.com/Microsoft/TypeScript/issues/29729). It will be removed once this issue is resolved.
 *
 * @example
 * ```typescript
 * type Pet2 = LiteralUnion<'dog' | 'cat', string>;
 *
 * const pet: Pet2 = '';
 *
 * // You **will** get auto-completion for `dog` and `cat` literals.
 * ```
 */
export type LiteralUnion<LiteralType, BaseType extends Primitive> = LiteralType | (BaseType & Record<never, never>);
