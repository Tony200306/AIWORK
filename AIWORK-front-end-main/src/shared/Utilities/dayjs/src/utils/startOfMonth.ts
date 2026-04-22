import { ConfigType, dayjs, Dayjs } from '../dayjsConfigGlobal';

interface StartOfMonth {
  /** The date from which to find the start of the month. */
  date: ConfigType;
}

/**
 * Retrieves the start of the month for a given date.
 *
 * @param {StartOfMonth} options - An object containing the date for which to find the start of the month.
 * @returns {Dayjs} A Dayjs object representing the start of the month for the specified date.
 *
 * @example
 * // Get the start of the month for January 15, 2024
 * const startOfMonthDate = startOfMonth({
 *   date: '2024-01-15'
 * });
 * console.log(startOfMonthDate.format('YYYY-MM-DD'));
 * // Output: '2024-01-01' (the actual output will vary based on the provided date)
 */
export const startOfMonth = ({ date }: StartOfMonth): Dayjs => {
  // Convert the date to a Dayjs object and find the start of the month
  return dayjs(date).startOf('month');
};
