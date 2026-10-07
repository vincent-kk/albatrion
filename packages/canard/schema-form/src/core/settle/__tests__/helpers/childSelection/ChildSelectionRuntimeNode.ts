import type { SchemaNodeDelivery, SchemaNodeRecord } from '../../../../record';

/** Structural observation adapter combining the public methods with the record contract. */
export interface ChildSelectionRuntimeNode extends SchemaNodeRecord<ChildSelectionRuntimeNode> {
  /** Consumer-visible value read alongside the settlement record's emission. */
  readonly value: unknown;
  /** Public validation issues captured without depending on the node class. */
  readonly errors: readonly unknown[];
  /** Attach one actual consumer and return its cleanup callback. */
  subscribe(listener: (event: SchemaNodeDelivery) => void): () => void;
  /** Resolve a public write target through the live shape. */
  find(path: string): ChildSelectionRuntimeNode | null;
  /** Execute one public replacement write and synchronous delivery chain. */
  setValue(value: unknown): void;
}
