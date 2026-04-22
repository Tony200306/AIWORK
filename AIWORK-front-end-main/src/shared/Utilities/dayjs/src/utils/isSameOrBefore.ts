import { ConfigType, dayjs } from '../dayjsConfigGlobal';

interface IsSameOrBefore {
  /** The date to check. */
  date: ConfigType;
  /** The date for comparison. */
  dateToCompare: ConfigType;
}

/**
 * Check if a specific date is the same as or before another date.
 *
 * @param {IsSameOrBefore} options - The options for comparison.
 * @returns {boolean} True if the date is the same as or before the dateToCompare, false otherwise.
 *
 * @example
 * // Check if February 14, 2024, is the same as or before February 20, 2024
 * const result = isSameOrBefore({
 *   date: '2024-02-14',
 *   dateToCompare: '2024-02-20'
 * });
 * console.log(result);
 * // Output: true (February 14, 2024, is the same as or before February 20, 2024)
 */
export const isSameOrBefore = ({ date, dateToCompare }: IsSameOrBefore): boolean => {
  const date_ = dayjs(date);
  const dateToCompare_ = dayjs(dateToCompare);
  return date_.isSame(dateToCompare_) || date_.isBefore(dateToCompare_);
};
