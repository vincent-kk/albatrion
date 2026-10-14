import type { DateInputType } from '../type';

/** HTML time components with optional seconds and one to three fractional digits. */
const TIME_PATTERN =
  /^(?:[01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9](?:\.[0-9]{1,3})?)?$/;

/** The separator between the date and time parts of a datetime-local value. */
const DATE_TIME_SEPARATOR = /[T ]/;

/** HTML month value: year and two-digit month. */
const MONTH_PATTERN = /^([0-9]{4,})-([0-9]{2})$/;

/** HTML week value: year and two-digit week number. */
const WEEK_PATTERN = /^([0-9]{4,})-W([0-9]{2})$/;

/** HTML date value: year, two-digit month and two-digit day. */
const DATE_PATTERN = /^([0-9]{4,})-([0-9]{2})-([0-9]{2})$/;

/**
 * Check whether a native HTML date input can display a value without blanking it.
 * @param type - HTML date, month, week, time, or datetime-local input type.
 * @param value - Initial value; null, undefined, and an empty string represent an empty input.
 * @returns Whether the value satisfies the type's grammar and Gregorian calendar bounds; non-string nonempty values return false.
 */
export const isRenderableDateInputValue = (
  type: DateInputType,
  value: unknown,
): boolean => {
  if (value === undefined || value === null || value === '') return true;
  if (typeof value !== 'string') return false;
  if (type === 'time') return TIME_PATTERN.test(value);
  const parts =
    type === 'datetime-local' ? value.split(DATE_TIME_SEPARATOR) : [value];
  if (
    type === 'datetime-local' &&
    (parts.length !== 2 || !TIME_PATTERN.test(parts[1]))
  )
    return false;
  const pattern =
    type === 'month'
      ? MONTH_PATTERN
      : type === 'week'
        ? WEEK_PATTERN
        : type === 'date' || type === 'datetime-local'
          ? DATE_PATTERN
          : undefined;
  const match = pattern?.exec(parts[0]);
  if (!match) return false;
  const year = BigInt(match[1]);
  if (year === 0n) return false;
  const leapYear =
    year % 4n === 0n && (year % 100n !== 0n || year % 400n === 0n);
  const component = Number(match[2]);
  if (type === 'week') {
    const previousYear = year - 1n;
    const weekday = Number(
      (previousYear +
        previousYear / 4n -
        previousYear / 100n +
        previousYear / 400n) %
        7n,
    );
    return (
      component >= 1 &&
      component <= (weekday === 3 || (weekday === 2 && leapYear) ? 53 : 52)
    );
  }
  if (component < 1 || component > 12) return false;
  if (type === 'month') return true;
  const day = Number(match[3]);
  const daysInMonth =
    component === 2
      ? leapYear
        ? 29
        : 28
      : component === 4 ||
          component === 6 ||
          component === 9 ||
          component === 11
        ? 30
        : 31;
  return day >= 1 && day <= daysInMonth;
};
