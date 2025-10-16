import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);

export const localTZ = dayjs.tz.guess();

export function checkBookingDate(date: string, time: string, timezone: string) {
  try {
    const str = `${date} ${time}`;
    const startLocal = dayjs(str, "DD/MM/YYYY HH:mm").tz(timezone);
    if (startLocal.isBefore(dayjs().tz(localTZ))) { 
      return 'Cannot book past slot in your local time'; 
    } else {
      return '';
    }
  } catch (e) {
      return 'Time parsing error'; 
  }
}

export function getDateByTimezone (date: string, time: string, timezone: string) {
  return dayjs(`${date} ${time}`, "DD/MM/YYYY HH:mm").tz(timezone)
}

export function parseDaysOfWeek(str: string) {
  return str?.length ? str.split(';').map(item => (+item)) : [];
}

export function getTime(date: Dayjs) {
  return `${date.format('HH')}:${date.format('mm')}`
}
