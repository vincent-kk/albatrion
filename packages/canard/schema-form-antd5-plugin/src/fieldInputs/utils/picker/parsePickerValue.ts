import dayjs from 'dayjs';

/** Stored format of time inputs and their bounds. */
export const TIME_FORMAT = 'HH:mm:00Z';

/**
 * Reads a saved picker value using the field format and RFC 3339 offset spelling.
 * @param value - Stored value or limit, with native Dayjs handling for absent values.
 * @param format - Format used by the field to publish its value.
 * @returns The Dayjs value displayed by the library.
 */
export const parsePickerValue = (
  value: string | null | undefined,
  format: string,
) =>
  dayjs(
    typeof value === 'string' && format === TIME_FORMAT
      ? value.replace(/z$/, 'Z')
      : value,
    format,
  );
