import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import minMax from 'dayjs/plugin/minMax';
import { Availability, defaultAvailability } from '../types';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);
dayjs.extend(minMax);

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
  return dayjs(`${date} ${time}`, "DD/MM/YYYY HH:mm").tz(timezone);
}

export function parseDaysOfWeek(str: string) {
  return str?.length ? str.split(';').map(item => (+item)) : [];
}

export function getTime(date: Dayjs) {
  return `${date.format('HH')}:${date.format('mm')}`
}

export function checkSlotsIntersection(slot1: defaultAvailability, slot2: defaultAvailability) {
  const intersectionStart = dayjs.max(
    getDateByTimezone('15/10/2025', slot1.startTime, localTZ),
    getDateByTimezone('15/10/2025', slot2.startTime, localTZ)
  );
  const intersectionEnd = dayjs.min(
    getDateByTimezone('15/10/2025', slot1.endTime, localTZ),
    getDateByTimezone('15/10/2025', slot2.endTime, localTZ)
  );

  return intersectionStart.isBefore(intersectionEnd);
}

function getDateWeekDay(dateString: string) {
  const day = dayjs(dateString, "DD/MM/YYYY").day();
  return day === 0 ? 7 : day;
}

const weekDays = ['', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays', 'Sundays'];

export function getIntersectionsList(currentSlot: defaultAvailability, allSlots: Availability[]): Array<string> {
  const listSet = new Set<string>();
  
  const slotDaysSet = new Set(currentSlot.daysOfWeek);
  const slotDateWeekDay = getDateWeekDay(currentSlot.selectedDate);
  
  allSlots.forEach(item => {
    if (item.selectedDate) {
      const itemDateWeekDay = getDateWeekDay(item.selectedDate);
      if (slotDaysSet.has(itemDateWeekDay) && checkSlotsIntersection(item, currentSlot)) {
        listSet.add(`${item.selectedDate} (${item.startTime}-${item.endTime})`);
      }
    }

    if (currentSlot.selectedDate) {
      const itemDaysSet = new Set(item.daysOfWeek);
      if (itemDaysSet.has(slotDateWeekDay) && checkSlotsIntersection(item, currentSlot)) {
        listSet.add(`${weekDays[slotDateWeekDay]} (${item.startTime}-${item.endTime})`);
      }
    }
    
    const daysIntersection = item.daysOfWeek.filter(number => slotDaysSet.has(number));
    if (daysIntersection.length && checkSlotsIntersection(item, currentSlot)) {
      daysIntersection.forEach(number => listSet.add(`${weekDays[number]} (${item.startTime}-${item.endTime})`));
    }
  });

  return [...listSet];
}