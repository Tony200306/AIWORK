import { ConfigType, dayjs, Dayjs } from '../dayjsConfigGlobal';

/**
 * Represents the configuration options for determining the start of the week from a given date.
 */
interface StartOfWeek {
  /**
   * The date for which to determine the start of the week.
   */
  date: ConfigType;
}

/**
 * Determines the start of the week from a given date using the DayJS library.
 *
 * @param options - An object containing the date for which to determine the start of the week.
 * @returns The DayJS instance representing the start of the week.
 *
 * @example
 * // Get the start of the week for the current date
 * const currentDate = new Date();
 * const result = startOfWeek({ date: currentDate });
 * console.log(result);
 * // Output: [DayJS instance representing the start of the week] (the actual output will vary based on the current date)
 *
 * @example
 * // Get the start of the week for a specific date
 * const specificDate = new Date('2024-02-14');
 * const resultForSpecificDate = startOfWeek({ date: specificDate });
 * console.log(resultForSpecificDate);
 * // Output: [DayJS instance representing the start of the week] (the actual output will vary based on the provided date)
 */
export const startOfWeek = ({ date }: StartOfWeek): Dayjs => {
  return dayjs(date).startOf('week');
};
