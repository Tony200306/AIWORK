import { ConfigType, dayjs } from '../dayjsConfigGlobal';

interface IsSameOrAfter {
  /** The date to check. */
  date: ConfigType;
  /** The date for comparison. */
  dateToCompare: ConfigType;
}

/**
 * Check if a specific date is the same as or after another date.
 *
 * @param {IsSameOrAfter} options - The options for comparison.
 * @returns {boolean} True if the date is the same as or after the dateToCompare, false otherwise.
 *
 * @example
 * // Check if February 14, 2024, is the same as or after February 10, 2024
 * const result = isSameOrAfter({
 *   date: '2024-02-14',
 *   dateToCompare: '2024-02-10'
 * });
 * console.log(result);
 * // Output: true (February 14, 2024, is the same as or after February 10, 2024)
 */
export const isSameOrAfter = ({ date, dateToCompare }: IsSameOrAfter): boolean => {
  const date_ = dayjs(date);
  const dateToCompare_ = dayjs(dateToCompare);
  return date_.isSame(dateToCompare_) || date_.isAfter(dateToCompare_);
};
