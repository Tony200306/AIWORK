import { ConfigType, dayjs } from '../dayjsConfigGlobal';
import { isSameOrAfter } from './isSameOrAfter';
import { isSameOrBefore } from './isSameOrBefore';

interface IsWithinRange {
  /** The date to check if it is within the specified range. */
  date: ConfigType;

  /** The start date of the range to compare against. */
  startDateToCompare: ConfigType;

  /** The end date of the range to compare against. */
  endDateToCompare: ConfigType;
}

/**
 * Checks if a given date is within the specified date range.
 *
 * @param {IsWithinRange} options - An object containing the date to check and the start and end dates of the range.
 * @returns {boolean} True if the date is within the specified range, false otherwise.
 *
 * @example
 * // Check if January 15, 2024, is within the range January 1, 2024, to January 31, 2024
 * const result = isWithinRange({
 *   date: '2024-01-15',
 *   startDateToCompare: '2024-01-01',
 *   endDateToCompare: '2024-01-31'
 * });
 * console.log(result);
 * // Output: true (January 15, 2024, is within the specified range)
 */
export const isWithinRange = ({ date, endDateToCompare, startDateToCompare }: IsWithinRange): boolean => {
  // Convert the dates to Dayjs objects and check if the date is within the specified range
  const date_ = dayjs(date);
  const endDateToCompare_ = dayjs(endDateToCompare);
  const startDateToCompare_ = dayjs(startDateToCompare);

  return (
    isSameOrAfter({ date: date_, dateToCompare: startDateToCompare_ }) &&
    isSameOrBefore({ date: date_, dateToCompare: endDateToCompare_ })
  );
};
