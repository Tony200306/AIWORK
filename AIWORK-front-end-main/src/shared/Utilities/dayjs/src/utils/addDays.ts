import { ConfigType, Dayjs, dayjs } from '../dayjsConfigGlobal';

interface AddDaysParams {
  /** The date to which days should be added. */
  date: ConfigType;
  /**  The number of days to add to the date. */
  amount: number;
}

/**
 * Adds a specified number of days to the given date.
 *
 * @param {AddDaysParams} params - The parameters for the operation.
 * @param {ConfigType} params.date - The date to which days should be added.
 * @param {number} params.amount - The number of days to add to the date.
 * @returns {Dayjs} - A new Dayjs object representing the resulting date after adding the specified days.
 *
 * @example
 * // Adding 3 days to the current date
 * const result = addDays({ date: new Date(), amount: 3 });
 * console.log(result.format('YYYY-MM-DD')); // Output: the date three days from now
 *
 * @example
 * // Adding 7 days to a specific date
 * const specificDate = dayjs('2024-01-20');
 * const result2 = addDays({ date: specificDate, amount: 7 });
 * console.log(result2.format('YYYY-MM-DD')); // Output: the date seven days from '2024-01-20'
 */
export const addDays = ({ amount, date }: AddDaysParams): Dayjs => {
  return dayjs(date).add(amount, 'days');
};
