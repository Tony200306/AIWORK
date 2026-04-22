import { ConfigType, dayjs } from '../dayjsConfigGlobal';

interface IsAfter {
  /** The date to check if it is after another date. */
  date: ConfigType;

  /** The date to compare against. */
  dateToCompare: ConfigType;
}

/**
 * Checks if a given date is after another date.
 *
 * @param {IsAfter} options - An object containing the date to check and the date to compare against.
 * @returns {boolean} True if the first date is after the second date, false otherwise.
 *
 * @example
 * // Check if March 1, 2024, is after January 1, 2024
 * const result = isAfter({
 *   date: '2024-03-01',
 *   dateToCompare: '2024-01-01'
 * });
 * console.log(result);
 * // Output: true (March 1, 2024, is after January 1, 2024)
 */
export const isAfter = ({ date, dateToCompare }: IsAfter): boolean => {
  // Convert the dates to Dayjs objects and check if the first date is after the second date
  const date_ = dayjs(date);
  const dateToCompare_ = dayjs(dateToCompare);
  return date_.isAfter(dateToCompare_);
};
