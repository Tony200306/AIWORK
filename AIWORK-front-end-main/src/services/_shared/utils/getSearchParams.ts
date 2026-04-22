import { path } from 'ramda';
import { AnyRecord } from '~/shared/TypescriptUtilities';
import { Searcher } from '../types/ServiceSearchParams';

const isEnum = (value: string) => {
  return value.toUpperCase() === value;
};

export const getSearchParams = <T extends AnyRecord>(searcher: Searcher<T>) => {
  return Object.keys(searcher).reduce<Record<string, string>>((res, searchKey) => {
    const searchItem = path([searchKey], searcher);
    if (searchItem && !Array.isArray(searchItem)) {
      const { operator, value } = searchItem;
      const key = operator ? `${searchKey}[${operator}]` : searchKey;
      if (value) {
        return {
          ...res,
          [key]: typeof value === 'string' && !isEnum(value) ? value.trim().toLowerCase() : value,
        };
      }
      return res;
    }
    if (searchItem && Array.isArray(searchItem)) {
      const groupParams = searchItem.reduce<Record<string, string>>((result, item) => {
        const { operator, value } = item;
        const key = `${searchKey}[${operator}]`;
        return {
          ...result,
          [key]: typeof value === 'string' && !isEnum(value) ? value.trim().toLowerCase() : value,
        };
      }, {});

      return {
        ...res,
        ...groupParams,
      };
    }
    return res;
  }, {});
};
