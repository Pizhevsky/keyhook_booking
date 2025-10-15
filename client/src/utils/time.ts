import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);

export const localTZ = dayjs.tz.guess();

export function slotLabel(dayOfWeek: number, startTime: string, endTime: string) {
  const today = dayjs();
  const currentWeekMonday = today.startOf('week').add(1, 'day');
  const target = currentWeekMonday.add(dayOfWeek - 1, 'day');
  const start = dayjs(`${target.format('DD/MM/YYYY')}T${startTime}:00`).tz(localTZ);
  const end = dayjs(`${target.format('DD/MM/YYYY')}T${endTime}:00`).tz(localTZ);
  return `${start.format('ddd DD MMM, HH:mm')} - ${end.format('HH:mm')} (${localTZ})`;
}

export function getDayOfWeek(date: Dayjs) {
  return date.day();
}

export function parseDaysOfWeek(str: string) {
  return str.split(';').map(item => (+item));
}

export function getTime(date: Dayjs) {
  return `${date.format('HH')}:${date.format('mm')}`
}
