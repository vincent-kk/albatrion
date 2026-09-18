import type { SerializationOptions } from '../../type';

/** Tagged scalar or graph reference, independent of user property names. */
export type Token = [string, ...any[]];
/** Flat identity table node; validated before decoding. */
export type GraphNode = [string, ...any[]];
/** Traversal policy shared by graph storage and structural keys. */
export interface TraversalOptions extends SerializationOptions {
  /** Sort property names for deterministic structural keys. */
  sorted?: boolean;
  /** Resolve unsupported identities inside a key factory. */
  opaque?: (value: object | symbol) => number;
}
/** Mutable state owned by one traversal, never shared between calls. */
export interface TraversalState {
  /** Identity discovery order. */
  objects: object[];
  /** Identity to node table index. */
  seen: Map<object, number>;
  /** Per-call traversal policy. */
  options: TraversalOptions;
  /** Count of retained properties and collection entries. */
  entries: number;
  /** Sum of logical array lengths, including holes. */
  arrayLength: number;
}
