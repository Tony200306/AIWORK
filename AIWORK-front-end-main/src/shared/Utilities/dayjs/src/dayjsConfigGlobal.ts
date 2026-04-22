import dayjs, { Dayjs } from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localeData from 'dayjs/plugin/localeData';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import updateLocale from 'dayjs/plugin/updateLocale';
import utc from 'dayjs/plugin/utc';
import weekday from 'dayjs/plugin/weekday';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekYear from 'dayjs/plugin/weekYear';

dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(localeData);
dayjs.extend(relativeTime);
dayjs.extend(timezone);
dayjs.extend(updateLocale);
dayjs.extend(utc);
dayjs.extend(weekday);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);

export type { ConfigType } from 'dayjs';
export { Dayjs, dayjs };
