/** One absent branch host's source channels and candidate-owned array positions. */
export class HostLatent {
  /** Host-owned source; array captures retain one value per position. */
  readonly raw: unknown;
  /** Undeclared keys retained in received order. */
  readonly undeclaredValues: unknown;
  /** Array positions restored from candidate-specific latent keys instead of the raw array. */
  readonly retainedItemNames?: readonly string[];

  /**
   * Freeze one host source so later distribution cannot mutate its history.
   * @param raw - Non-plain host value, when present
   * @param extras - Undeclared keys owned by this host
   * @param retainedItemNames - Array positions whose candidate-owned sources survive host capture
   */
  constructor(raw: unknown, extras: unknown, retainedItemNames?: string[]) {
    this.raw = raw;
    this.undeclaredValues = extras;
    if (retainedItemNames?.length)
      this.retainedItemNames = Object.freeze(retainedItemNames);
    Object.freeze(this);
  }
}
