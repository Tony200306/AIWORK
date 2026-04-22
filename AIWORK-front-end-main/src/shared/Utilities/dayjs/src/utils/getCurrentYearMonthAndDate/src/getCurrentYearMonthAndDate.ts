import { getDateMonthAndYear } from '../../getDateMonthAndYear/src/getDateMonthAndYear';
import { startOfToday } from '../../startOfToday';

/**
 * Retrieves the current year, month, and the start of the month.
 *
 * @returns {ReturnType<typeof getDateMonthAndYear>} An object containing the current year, month, and the start of the month.
 *
 * @example
 * // Get the current year, month, and start of the month
 * const result = getCurrentYearMonthAndDate();
 * console.log(result);
 * // Output: { year: 2024, month: 0, date: Dayjs('2024-01-01') } (the actual output will vary based on the current date)
 */
export const getCurrentYearMonthAndDate = (): ReturnType<typeof getDateMonthAndYear> => {
  // Retrieve the current year, month, and the start of the month
  return getDateMonthAndYear({ date: startOfToday() });
};
