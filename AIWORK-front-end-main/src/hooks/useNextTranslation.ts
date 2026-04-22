import { Formats, TranslationValues, useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { PathKeyOfObject } from '~/shared/TypescriptUtilities';

const translateStoreRef: { current?: ReturnType<typeof useTranslations> } = {};

export const useNextTranslation = () => {
  const translation = useTranslations();

  useEffect(() => {
    translateStoreRef.current = translation;
  }, [translation]);

  return translation as TFunction;
};

useNextTranslation.translate = function <TargetKey extends PathKeyOfObject<IntlMessages>>(
  key: TargetKey,
  values?: TranslationValues,
  formats?: Formats,
): string {
  return translateStoreRef.current?.(key as any, values as any, formats as any) ?? '';
};

export type TargetKey = PathKeyOfObject<IntlMessages>;

export type TFunction = <TargetKey extends PathKeyOfObject<IntlMessages>>(
  key: TargetKey,
  values?: TranslationValues,
  formats?: Formats,
) => string;
