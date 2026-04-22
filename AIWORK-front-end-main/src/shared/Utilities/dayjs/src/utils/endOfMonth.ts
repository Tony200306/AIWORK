import { ConfigType, dayjs } from '../dayjsConfigGlobal';

interface EndOfMonth {
  /** The date for which to determine the end of the month. */
  date: ConfigType;
}

/**
 * Determines the end of the month from a given date using the DayJS library.
 *
 * @param options - An object containing the date for which to determine the end of the month.
 * @returns The date representing the end of the month.
 *
 * @example
 * // Get the end of the month for the current date
 * const currentDate = new Date();
 * const result = endOfMonth({ date: currentDate });
 * console.log(result);
 * // Output: [date representing the end of the month] (the actual output will vary based on the current date)
 *
 * @example
 * // Get the end of the month for a specific date
 * const specificDate = new Date('2024-02-14');
 * const resultForSpecificDate = endOfMonth({ date: specificDate });
 * console.log(resultForSpecificDate);
 * // Output: [date representing the end of the month] (the actual output will vary based on the provided date)
 */
export const endOfMonth = ({ date }: EndOfMonth): ConfigType => {
  return dayjs(date).endOf('month');
};
