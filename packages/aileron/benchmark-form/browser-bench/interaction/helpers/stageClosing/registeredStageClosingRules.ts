/** Approved closing v1 plus Amendments 1 and 2; frozen before any formal window. */
export const REGISTERED_STAGE_CLOSING_RULES = {
  version: 'closing-v1-amendment-2',
  baselineCommit: '5d1348ed16054efa1ec431945eb00472f4eef7f1',
  stageCommit: 'facd72a71c44a798f5484827509073a27fb678a3',
  warmup: 3,
  pages: 10,
  keysPerPage: 20,
  operations: 10,
  slotMs: 1000,
  seed: 20261031,
  resamples: 10000,
  ratioLimit: 1.1,
  diagnosisLower: 1.05,
  vsyncDifferenceMs: 8.35,
  durationAllowanceMs: 8,
  frameAllowance: 1,
  arrivalLimitMs: 33.4,
  probeLimit: 0.9,
  verificationPath:
    'packages/canard/schema-form/architecture/plan/input-responsiveness/verification.md',
  rulesPath:
    'packages/aileron/benchmark-form/browser-bench/interaction/helpers/stageClosing/registeredStageClosingRules.ts',
  probeRows: [
    'type-flat-500-validate-nonburst',
    'type-flat-500-validate-burst',
  ],
};
