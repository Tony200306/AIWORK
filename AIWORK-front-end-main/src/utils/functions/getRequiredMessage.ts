import { TargetKey, TFunction } from '~/hooks/useNextTranslation';

export const getRequiredMessage = (t: TFunction, key: TargetKey) => {
  return t('CommonLocales.type_required', { field: t(key).toLowerCase() }).toString();
};
