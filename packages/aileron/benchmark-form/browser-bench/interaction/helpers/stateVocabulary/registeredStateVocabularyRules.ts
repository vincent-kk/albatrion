/** Frozen state-vocabulary policy; closing-v3-amendment-6 supplies unchanged C2–C6 logic. */
export const REGISTERED_STATE_VOCABULARY_RULES = {
  stage: 'state-vocabulary',
  version: 'state-vocabulary-v1',
  closingVersion: 'closing-v3-amendment-6',
  warmup: 3,
  pages: 10,
  keysPerPage: 20,
  seed: 20261031,
  resamples: 10000,
  ratioLimit: 1.1,
  processingDifferenceMs: 1,
  callDifferenceMs: 1,
  reportRows: ['is-divergent-flat-2000', 'heap-flat-2000-100-edits'],
  verificationPath:
    'packages/canard/schema-form/architecture/plan/state-vocabulary/measurement.md',
  rulesPath:
    'packages/aileron/benchmark-form/browser-bench/interaction/helpers/stateVocabulary/registeredStateVocabularyRules.ts',
};
