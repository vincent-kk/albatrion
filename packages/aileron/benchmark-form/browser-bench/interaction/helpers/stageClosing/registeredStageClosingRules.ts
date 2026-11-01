import type { ValidatorWorkException } from '../../stageClosingTypes';

/** Design-attributed deviations must be registered before the formal window. */
const validatorWorkExceptions: ValidatorWorkException[] = [];

/** Fixed closing thresholds and work-count exceptions for the registered window. */
export const REGISTERED_STAGE_CLOSING_RULES = {
  version: 'closing-v3-amendment-6',
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
  operationFrameFloorMs: 50,
  operationFrameDifferenceMs: 16.7,
  durationAllowanceMs: 8,
  frameAllowance: 1,
  arrivalLimitMs: 33.4,
  validatorWorkExceptions,
  validatorWorkRows: [
    'mount-flat-500-validate',
    'mount-nested-d5-f4-validate',
    'mount-array-1000-validate',
    'mount-flat-500-onrequest',
    'mount-flat-500-always',
    'reset-flat-500-same',
    'reset-flat-500-replace',
    'rebuild-flat-500',
    'validate-flat-500-settled',
  ],
  verificationPath:
    'packages/canard/schema-form/architecture/plan/input-responsiveness/verification.md',
  rulesPath:
    'packages/aileron/benchmark-form/browser-bench/interaction/helpers/stageClosing/registeredStageClosingRules.ts',
};
