/** One 60 Hz frame; rAF gaps above it count as overflow and blocking medians above it leave the budget. */
export const CORE_FRAME_BUDGET_MS = 16.7;
/** Informational 120 Hz frame budget; never changes RAIL grading or weighted exchanges. */
export const CORE_FRAME_BUDGET_120_MS = 8.3;
