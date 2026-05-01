import { Availability, ServerAvailability } from "../types";
import { parseDaysOfWeek } from './time';

export function arrayToObjectByKey<T extends object, K extends keyof T>(
  key: K,
  array: T[],
): Record<string, T> {
  return Object.fromEntries(array.map(item => [String(item[key]), item]));
}

export function mapServerAvailability(item: ServerAvailability): Availability {
  return {
    ...item,
    daysOfWeek: parseDaysOfWeek(item.daysOfWeek)
  };
}