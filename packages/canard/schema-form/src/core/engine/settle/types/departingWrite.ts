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
};

/** The leaving occurrence and the address below it, before a write names a kind and a value. */
export type DepartingAddress<Self> = Pick<
  DepartingWrite<Self>,
  'node' | 'suffix'
>;
