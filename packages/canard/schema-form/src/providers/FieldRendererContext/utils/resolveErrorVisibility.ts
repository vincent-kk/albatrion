/** Apply the reveal hold to policy eligibility; callers compose enabled where the display requires it.
 * @param live - Current condition and, for renderer/input, current enabled.
 * @param baseline - Engine baseline condition and the corresponding enabled baseline.
 * @param pending - Snapshot returned by the display's external-store hook.
 * @returns Whether this entry may show its current raw verdict. */
export const resolveErrorVisibility = (
  live: boolean,
  baseline: boolean,
  pending: boolean,
): boolean => live && (!pending || baseline);
