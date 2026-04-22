import { ConfigType, dayjs } from '../dayjsConfigGlobal';

interface Format {
  /** The date to be formatted. */
  date: ConfigType;

  /**
   * The format string used to format the date (following the Day.js formatting syntax).
   * For example, 'YYYY-MM-DD HH:mm:ss'.
   */
  format: string;
}

/**
 * Formats a given date using the specified format string.
 *
 * @param {Format} options - An object containing the date to be formatted and the format string.
 * @returns {string} A string representing the formatted date.
 *
 * @example
 * // Format the current date in the 'YYYY-MM-DD HH:mm:ss' format
 * const formattedDate = format({
 *   date: new Date(),
 *   format: 'YYYY-MM-DD HH:mm:ss'
 * });
 * console.log(formattedDate);
 * // Output: '2024-01-20 14:30:00' (the actual output will vary based on the current date and time)
 */
export const format = ({ date, format }: Format): string => {
  // Format the provided date using the specified format string
  return dayjs(date).format(format);
};
