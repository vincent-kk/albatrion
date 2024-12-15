const DURATION_REGEX = /^\s*(\d+)\s*(ms|s|m|h)\s*$/;

export const getMillisecondsFromDuration = (input: string) => {
  const [, durationString, unit] = input.match(DURATION_REGEX) || [];
  if (!durationString || !unit) return 0;
  const duration = parseInt(durationString);
  if (unit === 'ms') return duration;
  if (unit === 's') return duration * 1000;
  if (unit === 'm') return duration * 60 * 1000;
  if (unit === 'h') return duration * 60 * 60 * 1000;
  else return 0;
};
