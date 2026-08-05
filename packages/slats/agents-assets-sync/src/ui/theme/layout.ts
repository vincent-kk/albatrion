export const spacing = {
  xs: 0,
  sm: 1,
  md: 2,
  lg: 3,
  xl: 4,
} as const;

export const widths = {
  statusBadge: 10,
  pathColumn: 60,
  progressBarDefault: 28,
  targetCardCount: 18,
  minTerminalWidth: 60,
  idealTerminalWidth: 120,
} as const;

export const limits = {
  maxWarningsBeforeCollapse: 10,
  maxPlanRowsBeforeTruncate: 40,
  planTruncatedReveal: 15,
} as const;
