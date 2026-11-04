/** Root string leaf added to every validated shape so the load verdict carries exactly one known error. */
export const CORE_PROBE = {
  /** Public path of the probe leaf. */
  path: '/probe',
  /** Property name under the root object. */
  name: 'probe',
  /** String leaf, so it mounts as one native input. */
  type: 'string',
  /** Even-length values pass; the typing leaves share it. */
  pattern: '^(?:..)*$',
  /** Odd length, so the load verdict rejects it. */
  default: 'x',
  /** Even-length initial value of the flat typed leaf, so the first key flips the marker 0→1; array items keep `name-0`. */
  typedDefault: '',
} as const;
