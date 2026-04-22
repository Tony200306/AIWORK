import { ConfigType, dayjs } from '../dayjsConfigGlobal';

interface IsSameDay {
  /** The date to check if it is the same day as another date. */
  date: ConfigType;

  /** The date to compare against. */
  dateToCompare: ConfigType;
}

/**
 * Checks if a given date is the same day as another date.
 *
 * @param {IsSameDay} options - An object containing the date to check and the date to compare against.
 * @returns {boolean} True if the two dates represent the same day, false otherwise.
 *
 * @example
 * // Check if January 1, 2024, is the same day as January 1, 2024
 * const result = isSameDay({
 *   date: '2024-01-01',
 *   dateToCompare: '2024-01-01'
 * });
 * console.log(result);
 * // Output: true (January 1, 2024, is the same day as January 1, 2024)
 */
export const isSameDay = ({ date, dateToCompare }: IsSameDay): boolean => {
  // Convert the dates to Dayjs objects and check if they represent the same day
  const date_ = dayjs(date);
  const dateToCompare_ = dayjs(dateToCompare);
  return date_.isSame(dateToCompare_, 'day');
};
