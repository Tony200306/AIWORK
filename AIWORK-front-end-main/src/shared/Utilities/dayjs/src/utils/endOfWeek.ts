import { ConfigType, dayjs } from '../dayjsConfigGlobal';

interface EndOfWeek {
  /** The date for which to determine the end of the week. */
  date: ConfigType;
}

/**
 * Determines the end of the week from a given date using the DayJS library.
 *
 * @param options - An object containing the date for which to determine the end of the week.
 * @returns The date representing the end of the week.
 *
 * @example
 * // Get the end of the week for the current date
 * const currentDate = new Date();
 * const result = endOfWeek({ date: currentDate });
 * console.log(result);
 * // Output: [date representing the end of the week] (the actual output will vary based on the current date)
 *
 * @example
 * // Get the end of the week for a specific date
 * const specificDate = new Date('2024-02-14');
 * const resultForSpecificDate = endOfWeek({ date: specificDate });
 * console.log(resultForSpecificDate);
 * // Output: [date representing the end of the week] (the actual output will vary based on the provided date)
 */
export const endOfWeek = ({ date }: EndOfWeek): ConfigType => {
  return dayjs(date).endOf('week');
};
