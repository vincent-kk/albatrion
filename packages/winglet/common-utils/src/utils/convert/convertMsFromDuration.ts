import { HOUR, MINUTE, SECOND } from '@/common-utils/constant';

let DURATION_REGEX: RegExp;

/**
 * Convert a duration string to milliseconds
 * @param duration - The duration string to convert
 * @returns The duration in milliseconds
 */
export const convertMsFromDuration = (duration: string) => {
  if (!DURATION_REGEX) DURATION_REGEX = /^\s*(\d+)\s*(ms|s|m|h)\s*$/;
  const [, durationString, unit] = duration.match(DURATION_REGEX) || [];
  if (!durationString || !unit) return 0;
  const durationNumber = parseInt(durationString);
  if (unit === 'ms') return durationNumber;
  if (unit === 's') return durationNumber * SECOND;
  if (unit === 'm') return durationNumber * MINUTE;
  if (unit === 'h') return durationNumber * HOUR;
  else return 0;
};
