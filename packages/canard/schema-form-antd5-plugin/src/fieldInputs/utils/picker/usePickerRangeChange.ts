import type { Dayjs } from 'dayjs';

import { useHandle } from '@winglet/react-utils/hook';

import type { FieldInputProps } from '@canard/schema-form';

/** Provisional or completed picker selection, or null when cleared. */
type PickerRange = [Dayjs | null, Dayjs | null] | null;

/**
 * Connects a picker's completed selection and clear events to the field.
 * @param onChange - Publishes the saved pair or clears it.
 * @param format - Stored spelling of each endpoint.
 * @returns A callback that ignores provisional ranges.
 */
export const usePickerRangeChange = (
  onChange: FieldInputProps<[string | null, string | null] | null>['onChange'],
  format: string,
): ((range: PickerRange) => void) =>
  useHandle((range: PickerRange) => {
    if (!range) return onChange(undefined);
    const [start, end] = range;
    if (start && end) onChange([start.format(format), end.format(format)]);
  });
