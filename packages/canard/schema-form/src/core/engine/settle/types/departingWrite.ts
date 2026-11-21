import type { BlueprintNode } from '../../blueprint';

/**
 * One declarative value kept for an address at or below a node leaving in this settlement.
 * The exit policy runs first and this value then replaces its result at the address (WRITE-079).
 */
export type DepartingWrite<Self> = {
  /** Nearest occurrence on the written address that leaves in this settlement. */
  readonly node: Self;
  /** Pointer from the leaving node to the written address; empty when the node itself is written. */
  readonly suffix: string;
  /** Kind that interprets the value at the written address. */
  readonly template: BlueprintNode;
  /** Defined value; records apply in the order they are made, which is rank order, so a later record wins where the two overlap. */
  readonly value: unknown;
  /** Remaining named channels after the whole input was applied to the revived occurrence. */
  revived?: RevivedSlotSource<Self>;
};

/** The leaving occurrence and the address below it, before a write names a kind and a value. */
export type DepartingAddress<Self> = Pick<
  DepartingWrite<Self>,
  'node' | 'suffix'
>;

/** Named channels retained at the binding where a cancelled exit reapplied them. */
export interface RevivedSlotSource<Self> {
  /** Whole record still responsible for this piece of the named input. */
  readonly write: DepartingWrite<Self>;
  /** Parent right, used to select partial projection after one child is replaced. */
  readonly parent?: RevivedSlotSource<Self>;
  /** Declaration that interprets the post-policy input. */
  readonly template: BlueprintNode;
  /** Address relative to the occurrence that received the departing write. */
  readonly suffix: string;
  /** Original payload, including extras and whole-array length. */
  readonly value: unknown;
  /** Named descendants that can be projected independently of the own channels. */
  children?: RevivedSlotSource<Self>[];
  /** Whether a later write owns the own channel at this binding. */
  isSuperseded?: boolean;
  /** Whether a descendant must be omitted from the original whole payload. */
  hasSupersededChild?: boolean;
}
