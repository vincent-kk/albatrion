/** Root string leaf added to every validated shape so the load verdict carries exactly one known error. */
export const CORE_PROBE = {
  /** Public path of the probe leaf. */
  path: '/probe',
  /** Property name under the root object. */
  name: 'probe',
  /** Even-length values pass; the typing leaves share it. */
  pattern: '^(?:..)*$',
  /** Odd length, so the load verdict rejects it. */
  default: 'x',
} as const;
