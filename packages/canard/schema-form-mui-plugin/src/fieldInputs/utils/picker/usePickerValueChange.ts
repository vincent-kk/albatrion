import type { Dayjs } from 'dayjs';

import { useHandle } from '@winglet/react-utils/hook';

import type { FieldInputProps } from '@canard/schema-form';

/**
 * Publish formatted picker values and clearing to the form.
 * @param onChange - Core value binding.
 * @param format - Stored date, month or time format.
 * @returns The native picker callback.
 */
export const usePickerValueChange = (
  onChange: FieldInputProps<string | null>['onChange'],
  format: string,
): ((value: Dayjs | null) => void) =>
  useHandle((value: Dayjs | null) => {
    if (value === null) onChange(undefined);
    else if (value.isValid()) onChange(value.format(format));
  });
