import { Dayjs, dayjs } from '../dayjsConfigGlobal';

/**
 * Retrieves the start of the current day.
 *
 * @returns {Dayjs} A Dayjs object representing the start of the current day.
 *
 * @example
 * // Get the start of today
 * const startOfTodayDate = startOfToday();
 * console.log(startOfTodayDate.format('YYYY-MM-DD'));
 * // Output: '2024-01-20' (the actual output will vary based on the current date)
 */
export const startOfToday = (): Dayjs => {
  // Find the start of the current day
  return dayjs().startOf('day');
};
