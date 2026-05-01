import dayjs from '../lib/dayjs';
import type { Dayjs } from '../lib/dayjs';
import type { Availability, AvailabilityDraft } from '../types';

export const localTZ = dayjs.tz.guess();

export const DATE_FORMAT = 'DD/MM/YYYY';
export const DATETIME_FORMAT = 'DD/MM/YYYY HH:mm';
export const REFERENCE_DATE = '01/01/2000';

// ── Slot time helpers ─────────────────────────────────────────────────────────

export const getDateByTimezone = (date: string, time: string, timezone: string): Dayjs => 
  dayjs.tz(`${date} ${time}`, DATETIME_FORMAT, timezone);

export const timeToRefDate = (time: string): Dayjs => 
  getDateByTimezone(REFERENCE_DATE, time, localTZ);

export function checkBookingDate(date: string, time: string, timezone: string): string {
  try {
    const slotStart = getDateByTimezone(date, time, timezone);

    if (!slotStart.isValid()) return 'Time parsing error';
    
    return slotStart.isBefore(dayjs().tz(localTZ))
      ? 'Cannot book past slot in your local time'
      : '';
  } catch {
    return 'Time parsing error'; 
  }
}

export function parseDaysOfWeek(str: string): number[] {
  return str?.length ? str.split(';').map(item => (+item)) : [];
}

export function getTime(date: Dayjs): string {
  return date.format('HH:mm');
}

// ── Intersection detection ────────────────────────────────────────────────────

export const checkSlotsIntersection = (slot1: AvailabilityDraft, slot2: AvailabilityDraft): boolean => {
  const start = dayjs.max(timeToRefDate(slot1.startTime), timeToRefDate(slot2.startTime));
  const end = dayjs.min(timeToRefDate(slot1.endTime), timeToRefDate(slot2.endTime));

  return start !== null && end !== null && start.isBefore(end);
}

export const getDateWeekDay = (dateString: string): number => {
  if (!dateString) return -1;
  const day = dayjs(dateString, DATE_FORMAT).day();
  return day === 0 ? 7 : day;
}

const weekDays = ['', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays', 'Sundays'];

export const getIntersectionsList = (currentSlot: AvailabilityDraft, allSlots: Availability[]): string[] => {
  const listSet = new Set<string>();
  const slotDaysSet = new Set(currentSlot.daysOfWeek);
  const slotDateWeekDay = getDateWeekDay(currentSlot.selectedDate);
  
  allSlots.forEach(item => {
    // Skip self-comparison when editing an existing slot
    if (item.id !== undefined && item.id === currentSlot.id) return;

    // item is a one-off date that falls on a day in currentSlot's recurring days
    if (item.selectedDate) {
      const itemDateWeekDay = getDateWeekDay(item.selectedDate);
      if (slotDaysSet.has(itemDateWeekDay) && checkSlotsIntersection(item, currentSlot)) {
        listSet.add(`${item.selectedDate} (${item.startTime}-${item.endTime})`);
      }
    }

    // currentSlot is a one-off date that falls on a day in item's recurring days
    if (currentSlot.selectedDate) {
      const itemDaysSet = new Set(item.daysOfWeek);
      if (itemDaysSet.has(slotDateWeekDay) && checkSlotsIntersection(item, currentSlot)) {
        listSet.add(`${weekDays[slotDateWeekDay]} (${item.startTime}-${item.endTime})`);
      }
    }
    
    // Both are recurring and share at least one day
    const daysIntersection = item.daysOfWeek.filter(number => slotDaysSet.has(number));
    if (daysIntersection.length && checkSlotsIntersection(item, currentSlot)) {
      daysIntersection.forEach(number => { 
        listSet.add(`${weekDays[number]} (${item.startTime}-${item.endTime})`); 
      });
    }
  });

  return [...listSet];
}