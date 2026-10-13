/** An old item position that either survives at another position or perishes. */
export interface ArrayPathMove {
  /** Absolute item prefix before the structural edit. */
  readonly previous: string;
  /** Surviving item's absolute destination, absent when it perishes. */
  readonly current?: string;
}
