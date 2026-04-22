import { SearcherOperator } from '../constants/SearcherOperator';
import { SorterOperator } from '../constants/SorterOperator';

// Built-in type
type AnyObject = Record<string, any>;
type AnyArray = any[];
type AnyFunction = (...args: any[]) => any;
type PrimitiveType = string | number | boolean | null | undefined | AnyObject | AnyArray;

// Utils
type PickKeysByValue<T, V> = {
  [K in keyof T]: T[K] extends AnyFunction ? never : T[K] extends V ? K : never;
}[keyof T];
type PickProperties<T, P> = Pick<T, PickKeysByValue<T, P>>;
type GetKeyWithTypes<T, P> = Exclude<keyof PickProperties<T, P>, never>;

// Mains
type SubKeys<T, K extends string> = K extends keyof T ? `${K}.${PathKeyOfObject<T[K]>}` : never;

type PathKeyOfObject<T> = object extends T
  ? string
  : T extends any[]
    ?
        | Extract<GetKeyWithTypes<T[number], PrimitiveType>, string>
        | SubKeys<T[number], Extract<GetKeyWithTypes<T[number], PrimitiveType>, string>>
    : T extends object
      ?
          | Extract<GetKeyWithTypes<T, PrimitiveType>, string>
          | SubKeys<T, Extract<GetKeyWithTypes<T, PrimitiveType>, string>>
      : never;

type Path<T> = PathKeyOfObject<T>;

export type Sorter<T extends AnyObject> = Partial<Record<Path<T>, SorterOperator>>;

interface SearcherValue {
  operator: SearcherOperator | null;
  value?: any;
}
export type Searcher<T extends AnyObject, AdditionalKeys extends string = string> = Partial<
  Record<keyof T | AdditionalKeys, SearcherValue | SearcherValue[]>
> &
  Partial<Record<Path<T>, SearcherValue | SearcherValue[]>>;
