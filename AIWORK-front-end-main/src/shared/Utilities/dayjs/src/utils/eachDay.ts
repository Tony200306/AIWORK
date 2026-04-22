import { ConfigType, dayjs, Dayjs } from '../dayjsConfigGlobal';

interface EachDay {
  /** The start date for the range of days. */
  startDate: ConfigType;

  /** The end date for the range of days. */
  endDate: ConfigType;
}

/**
 * Generates an array of Dayjs objects representing each day in the specified range.
 *
 * @param {EachDay} options - An object containing the start and end dates.
 * @returns {Dayjs[]} An array of Dayjs objects representing each day in the specified range.
 * @example
 * // Generate an array of Dayjs objects for each day in January 2024
 * const january2024 = eachDay({
 *   startDate: '2024-01-01',
 *   endDate: '2024-01-31'
 * });
 * console.log(january2024);
 * // Output: [Dayjs('2024-01-01'), Dayjs('2024-01-02'), ..., Dayjs('2024-01-31')]
 */
export const eachDay = ({ endDate, startDate }: EachDay): Dayjs[] => {
  // Convert the start and end dates to Dayjs objects
  const startDate_ = dayjs(startDate);
  const endDate_ = dayjs(endDate);

  // Calculate the number of days in the range
  const numberOfDays = endDate_.diff(startDate_, 'day') + 1;

  // Generate an array of Dayjs objects for each day in the range
  const dayjsDates = Array.from({ length: numberOfDays }, (_, index) => {
    return startDate_.add(index, 'day');
  });

  return dayjsDates;
};
