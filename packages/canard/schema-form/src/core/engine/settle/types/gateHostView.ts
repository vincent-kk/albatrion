import type { Dictionary } from '@aileron/declare';

/** One immutable projection interval shared by gates at the same bound host. */
export interface GateHostView {
  /** Host publication identity before copying into the validator view. */
  readonly projected: unknown;
  /** Extras identity, including absence beneath blocking source ancestors. */
  readonly extra: unknown;
  /** Complete current input; never reused after either source identity changes. */
  readonly value: Dictionary<unknown>;
}
