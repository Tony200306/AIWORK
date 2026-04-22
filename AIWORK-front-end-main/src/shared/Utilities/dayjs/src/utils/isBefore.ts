import { ConfigType, dayjs } from '../dayjsConfigGlobal';

interface IsBefore {
  /** The date to check if it is before another date. */
  date: ConfigType;

  /** The date to compare against. */
  dateToCompare: ConfigType;
}

/**
 * Checks if a given date is before another date.
 *
 * @param {IsBefore} options - An object containing the date to check and the date to compare against.
 * @returns {boolean} True if the first date is before the second date, false otherwise.
 *
 * @example
 * // Check if January 1, 2024, is before March 1, 2024
 * const result = isBefore({
 *   date: '2024-01-01',
 *   dateToCompare: '2024-03-01'
 * });
 * console.log(result);
 * // Output: true (January 1, 2024, is before March 1, 2024)
 */
export const isBefore = ({ date, dateToCompare }: IsBefore): boolean => {
  // Convert the dates to Dayjs objects and check if the first date is before the second date
  const date_ = dayjs(date);
  const dateToCompare_ = dayjs(dateToCompare);
  return date_.isBefore(dateToCompare_);
};
