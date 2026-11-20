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
  /** Depth of the written address, so a write to an ancestor applies before one to its descendant. */
  readonly depth: number;
  /** Kind that interprets the value at the written address. */
  readonly template: BlueprintNode;
  /** Defined value; a later write in rank order to the same address is applied after it and wins. */
  readonly value: unknown;
};

/** The leaving occurrence and the address below it, before a write names a kind and a value. */
export type DepartingAddress<Self> = Pick<
  DepartingWrite<Self>,
  'node' | 'suffix' | 'depth'
>;
