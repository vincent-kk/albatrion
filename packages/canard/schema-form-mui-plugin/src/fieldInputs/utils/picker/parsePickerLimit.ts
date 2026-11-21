import dayjs, { type Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';

dayjs.extend(customParseFormat);

/**
 * Parse a configured boundary without rolling overflow into another period.
 * @param value - First or last allowed date or month.
 * @param format - The configured boundary format.
 * @returns A valid Dayjs boundary, or undefined for an absent or invalid limit.
 */
export const parsePickerLimit = (
  value: string | undefined,
  format: string,
): Dayjs | undefined => {
  if (!value) return undefined;
  const parsed = dayjs(value, format, true);
  return parsed.isValid() ? parsed : undefined;
};
