import type { Dayjs } from 'dayjs';

import { useHandle } from '@winglet/react-utils/hook';

import type { FieldInputProps } from '@canard/schema-form';

/**
 * Connects a picker's completed selection and clear events to the field.
 * @param onChange - Publishes the saved pair or clears it.
 * @param format - Stored spelling of each endpoint.
 * @returns A callback that ignores provisional ranges.
 */
export const usePickerRangeChange = (
  onChange: FieldInputProps<[string | null, string | null] | null>['onChange'],
  format: string,
) =>
  useHandle((range: [Dayjs | null, Dayjs | null] | null) => {
    if (!range) return onChange(undefined);
    const [start, end] = range;
    if (start && end) onChange([start.format(format), end.format(format)]);
  });
