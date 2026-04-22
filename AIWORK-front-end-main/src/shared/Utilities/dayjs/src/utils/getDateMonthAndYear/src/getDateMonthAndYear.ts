import { ConfigType, Dayjs } from '../../../dayjsConfigGlobal';
import { getMonth } from '../../getMonth';
import { getYear } from '../../getYear';
import { startOfMonth } from '../../startOfMonth';

interface GetDateMonthAndYear {
  /** The date for which to retrieve the year, month, and the start of the month.
   */
  date: ConfigType;
}

/**
 * Retrieves the year, month, and the start of the month for a given date.
 *
 * @param {GetDateMonthAndYear} options - An object containing the date for which to retrieve information.
 * @returns {{ year: number; month: number; date: Dayjs }} An object containing the year, month, and the start of the month.
 *
 * @example
 * // Get the year, month, and start of the month for January 15, 2024
 * const result = getDateMonthAndYear({
 *   date: '2024-01-15'
 * });
 * console.log(result);
 * // Output: { year: 2024, month: 0, date: Dayjs('2024-01-01') }
 */
export const getDateMonthAndYear = ({ date }: GetDateMonthAndYear): { year: number; month: number; date: Dayjs } => {
  // Find the start of the month for the provided date
  const date_ = startOfMonth({ date });

  // Retrieve the year and month for the start of the month
  const year = getYear({ date: date_ });
  const month = getMonth({ date: date_ });

  return {
    year,
    month,
    date: date_,
  };
};
