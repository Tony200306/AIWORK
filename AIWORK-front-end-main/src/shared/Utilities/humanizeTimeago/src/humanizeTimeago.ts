import { Opts, TDate, format as format_, register } from 'timeago.js';
import { vn } from './locales/vn';

register('vn', vn);

type Locale = 'en' | 'vn';

interface HumanizeTimeago {
  /**
   * The date to be formatted.
   * Can be a Date object, a string representing a date, or a number representing a timestamp.
   */
  date: TDate;
  /**
   * The locale to be used for formatting the date.
   * Default is 'en' (English).
   */
  locale?: Locale;
  /**
   * Optional settings for formatting.
   * Refer to the timeago.js documentation for available options.
   */
  opts?: Opts;
}

/**
 * Formats a date to a human-readable time-ago string.
 *
 * @param {HumanizeTimeago} param - An object containing the date, locale, and optional settings.
 * @param {TDate} param.date - The date to be formatted.
 * @param {Locale} [param.locale='en'] - The locale to be used for formatting.
 * @param {Opts} [param.opts] - Optional settings for formatting.
 * @returns {string} A human-readable time-ago string.
 */
export const humanizeTimeago = ({ date, locale = 'en', opts }: HumanizeTimeago): string => {
  return format_(date, locale, opts);
};
