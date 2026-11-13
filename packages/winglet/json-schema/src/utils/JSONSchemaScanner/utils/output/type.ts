/** A replacement's copy policy distinguishes caller values from isolated or explicitly shared targets. */
export interface ReplaceOperation {
  /** Discriminator leaves room for an ordered wrap operation without changing consumers. */
  kind: 'replace';
  /** Written JSON Pointer path captured during traversal. */
  path: string;
  /** Replacement value, including false. */
  value: unknown;
  /** Whether output must copy a caller-owned value before exposing it. */
  copy: boolean;
}

/** Ordered operations recorded by a scan; wrap will extend this union. */
export type OutputOperation = ReplaceOperation;

/** Persistent path overlay used only while building an output. */
export interface OperationNode {
  /** Last replacement at this path supersedes older descendant operations. */
  replacement?: ReplaceOperation;
  /** Child overlays are keyed by decoded pointer tokens, including reserved names. */
  children: Map<string, OperationNode>;
}
