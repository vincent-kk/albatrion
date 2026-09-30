/** One absent object host's own source channels, without composed child values. */
export class HostLatent {
  /** Non-plain source retained at this host. */
  readonly raw: unknown;
  /** Undeclared keys retained in received order. */
  readonly extras: unknown;

  /**
   * Freeze one host source so later distribution cannot mutate its history.
   * @param raw - Non-plain host value, when present
   * @param extras - Undeclared keys owned by this host
   */
  constructor(raw: unknown, extras: unknown) {
    this.raw = raw;
    this.extras = extras;
    Object.freeze(this);
  }
}
