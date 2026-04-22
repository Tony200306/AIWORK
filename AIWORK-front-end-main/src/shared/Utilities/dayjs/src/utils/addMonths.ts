import { ConfigType, dayjs, Dayjs } from '../dayjsConfigGlobal';

interface AddMonthsParams {
  /** The date to which months should be added. */
  date: ConfigType;
  /**  The number of months to add to the date. */
  amount: number;
}

/**
 * Adds a specified number of months to the given date.
 *
 * @param {Object} params - The parameters for the operation.
 * @param {ConfigType} params.date - The date to which months should be added.
 * @param {number} params.amount - The number of months to add to the date.
 * @returns {Dayjs} - A new Dayjs object representing the resulting date after adding the specified months.
 *
 * @typedef {Object} AddMonthsParams
 * @property {ConfigType} date - The date to which months should be added.
 * @property {number} amount - The number of months to add to the date.
 *
 * @example
 * // Adding 3 months to the current date
 * const result = addMonths({ date: new Date(), amount: 3 });
 * console.log(result.format('YYYY-MM-DD')); // Output: the date three months from now
 *
 * @example
 * // Adding 6 months to a specific date
 * const specificDate = dayjs('2024-01-20');
 * const result2 = addMonths({ date: specificDate, amount: 6 });
 * console.log(result2.format('YYYY-MM-DD')); // Output: the date six months from '2024-01-20'
 */
export const addMonths = ({ amount, date }: AddMonthsParams): Dayjs => {
  return dayjs(date).add(amount, 'months');
};
