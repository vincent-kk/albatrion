/** Grade boundaries; `rail` values are RAIL standard values, `own` values are this report's own thresholds. */
export const CORE_UX_THRESHOLDS = {
  /** One frame; a typing or first-key blocking median at or under it is ok (own threshold). */
  frameMs: 16.7,
  /** RAIL input handling: a blocking median at or under it is perceptible, above it janky. */
  railInputMs: 50,
  /** Long Task median at or under it is perceptible for loads (own threshold above the API's 50 ms floor). */
  longTaskPerceptibleMs: 100,
  /** RAIL response: feedback at or under it is ok for typing, first-key and rebuild. */
  railResponseMs: 100,
  /** Own threshold: feedback at or under it is perceptible for typing, first-key and rebuild. */
  responsePerceptibleMs: 300,
  /** Own load threshold: mount feedback at or under it is ok. */
  loadOkMs: 1000,
  /** Own load threshold: mount feedback at or under it is perceptible. */
  loadPerceptibleMs: 2000,
} as const;
