import type { BlueprintNode } from '../../blueprint';

/** An accepted input at an exact candidate address owned by a pending exit. */
export interface CandidateInput {
  /** Static declaration used to route the input at the physical address. */
  readonly template: BlueprintNode;
  /** Physical address relative to the occurrence that owns the pending exit. */
  readonly suffix: string;
  /** Accepted caller-independent input. */
  readonly value: unknown;
  /** Application rank already assigned on acceptance, preserved across reentry. */
  readonly order: number;
  /** Parent input when only these explicitly named channels survived reentry. */
  readonly parent?: CandidateInput;
  /** Named child decisions attached to their own actual candidate records. */
  children?: CandidateInput[];
  /** Reentry already applied the input whole; only its named channels remain. */
  isApplied?: true;
  /** A newer decision owns this candidate's own channel. */
  isSuperseded?: true;
  /** Some of this input's original payload belongs to a newer candidate decision. */
  hasSupersededChild?: true;
}
