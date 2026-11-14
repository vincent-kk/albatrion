/**
 * Converts a public duration to a CSS-safe millisecond string without throwing.
 * @param duration - Nonnegative milliseconds or a decimal ms/s string; undefined inherits.
 * @param fallback - Normalized duration used for omitted or invalid input.
 * @returns A millisecond string; invalid input emits a development warning.
 */
export const normalizeDuration = (
  duration: unknown,
  fallback: `${number}ms`,
): `${number}ms` => {
  if (duration === undefined) return fallback;
  const match =
    typeof duration === 'string'
      ? /^(\d+(?:\.\d+)?|\.\d+)(ms|s)$/.exec(duration)
      : null;
  const milliseconds =
    typeof duration === 'number'
      ? duration
      : match
        ? Number(match[1]) * (match[2] === 's' ? 1000 : 1)
        : NaN;
  if (Number.isFinite(milliseconds) && milliseconds >= 0)
    return `${milliseconds}ms`;
  if (process.env.NODE_ENV !== 'production')
    console.warn(
      '[promise-modal] Invalid duration; use nonnegative milliseconds or an ms/s string. Falling back to the default duration.',
    );
  return fallback;
};
