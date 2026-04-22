import { ConfigType, dayjs } from '../dayjsConfigGlobal';

interface IsSameMonth {
  /** The first date to compare. */
  date: ConfigType;

  /** The second date to compare. */
  dateToCompare: ConfigType;
}

/**
 * Checks if two dates are in the same month.
 *
 * @param {IsSameMonth} options - An object containing two dates for comparison.
 * @returns {boolean} True if the two dates are in the same month, false otherwise.
 *
 * @example
 * // Check if February 14, 2024, and February 20, 2024, are in the same month
 * const result = isSameMonth({
 *   date: '2024-02-14',
 *   dateToCompare: '2024-02-20'
 * });
 * console.log(result);
 * // Output: true (the specified dates are in the same month)
 */
export const isSameMonth = ({ date, dateToCompare }: IsSameMonth): boolean => {
  const date_ = dayjs(date);
  const dateToCompare_ = dayjs(dateToCompare);
  return date_.isSame(dateToCompare_, 'month');
};
