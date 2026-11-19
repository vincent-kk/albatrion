import dayjs from 'dayjs';

/**
 * Parse an offset-bearing time using RFC 3339's equivalent Z spellings.
 * @param value - Stored time or limit; an absent value retains dayjs's native handling.
 * @returns A dayjs value with the same local-time conversion as an uppercase offset.
 */
export const parseTime = (value: string | null | undefined) =>
  dayjs(typeof value === 'string' ? value.replace(/z$/, 'Z') : value, 'HH:mm:00Z');
