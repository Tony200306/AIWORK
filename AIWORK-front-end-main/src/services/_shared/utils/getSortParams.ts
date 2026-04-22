import { AnyRecord } from '~/shared/TypescriptUtilities';
import { Sorter } from '../types/ServiceSearchParams';

export const getSortParams = <T extends AnyRecord>(sorter: Sorter<T>) => {
  return Object.keys(sorter).reduce<Sorter<T>>((res, sorterKey) => {
    const key = `${sorterKey}[sort]`;
    return {
      ...res,
      [key]: sorter[sorterKey as keyof typeof sorter],
    };
  }, {});
};
