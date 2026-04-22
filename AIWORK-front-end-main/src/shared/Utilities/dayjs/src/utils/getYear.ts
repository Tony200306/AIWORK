import { ConfigType, dayjs } from '../dayjsConfigGlobal';

interface GetYear {
  /** The date from which to retrieve the year. */
  date: ConfigType;
}

/**
 * Retrieves the year from the given date.
 *
 * @param {GetYear} options - An object containing the date from which to retrieve the year.
 * @returns {number} The year of the specified date.
 *
 * @example
 * // Get the current year
 * const currentYear = getYear({
 *   date: new Date()
 * });
 * console.log(currentYear);
 * // Output: 2024 (the actual output will vary based on the current date)
 */
export const getYear = ({ date }: GetYear): number => {
  // Retrieve the year from the provided date
  return dayjs(date).get('year');
};
