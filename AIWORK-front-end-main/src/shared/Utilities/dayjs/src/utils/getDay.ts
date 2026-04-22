import { ConfigType, dayjs } from '../dayjsConfigGlobal';

interface GetDay {
  /** The date from which to retrieve the day. */
  date: ConfigType;
}

/**
 * Retrieves the day from a given date using the DayJS library.
 *
 * @param options - An object containing the date for which to retrieve the day.
 * @returns The day of the week as a number (0 for Sunday, 1 for Monday, etc.).
 *
 * @example
 * // Get the day of the week for the current date
 * const currentDate = new Date();
 * const result = getDay({ date: currentDate });
 * console.log(result);
 * // Output: [day of the week as a number] (the actual output will vary based on the current date)
 *
 * @example
 * // Get the day of the week for a specific date
 * const specificDate = new Date('2024-02-14');
 * const resultForSpecificDate = getDay({ date: specificDate });
 * console.log(resultForSpecificDate);
 * // Output: [day of the week as a number] (the actual output will vary based on the provided date)
 */
export const getDay = ({ date }: GetDay): number => {
  return dayjs(date).get('day');
};
