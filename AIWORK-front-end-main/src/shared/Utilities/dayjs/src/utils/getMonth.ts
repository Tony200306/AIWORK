import { ConfigType, dayjs } from '../dayjsConfigGlobal';

interface GetMonth {
  /** The date from which to retrieve the month. */
  date: ConfigType;
}

/**
 * Retrieves the month (0-indexed) from the given date.
 *
 * @param {GetMonth} options - An object containing the date from which to retrieve the month.
 * @returns {number} The month (0-indexed) of the specified date.
 *
 * @example
 * // Get the current month (0-indexed)
 * const currentMonth = getMonth({
 *   date: new Date()
 * });
 * console.log(currentMonth);
 * // Output: 0 to 11, representing January to December (the actual output will vary based on the current date)
 */
export const getMonth = ({ date }: GetMonth): number => {
  // Retrieve the month (0-indexed) from the provided date
  return dayjs(date).get('month');
};
