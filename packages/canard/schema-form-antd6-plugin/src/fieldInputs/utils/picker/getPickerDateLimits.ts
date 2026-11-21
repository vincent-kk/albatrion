import type { Dayjs } from 'dayjs';

import { parsePickerValue } from './parsePickerValue';

/**
 * Supplies the calendar's boundary predicate in the field's comparison unit.
 * @param minimum - Optional first selectable date or month.
 * @param maximum - Optional last selectable date or month.
 * @param format - Stored spelling shared by the field and its limits.
 * @param unit - Calendar unit used for the comparison.
 * @returns The predicate passed to the picker.
 */
export const getPickerDateLimits = (
  minimum: string | undefined,
  maximum: string | undefined,
  format: string,
  unit: 'day' | 'month',
) => {
  const first = minimum ? parsePickerValue(minimum, format) : undefined;
  const last = maximum ? parsePickerValue(maximum, format) : undefined;
  return (date: Dayjs | null) =>
    !!(
      date &&
      ((first && date.isBefore(first, unit)) ||
        (last && date.isAfter(last, unit)))
    );
};
