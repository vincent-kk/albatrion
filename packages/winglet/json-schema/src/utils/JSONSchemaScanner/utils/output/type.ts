/** A replacement's copy policy distinguishes caller values from privately owned target copies. */
export interface ReplaceOperation {
  /** Replacement discriminator for an ordered output operation. */
  kind: 'replace';
  /** Written JSON Pointer path captured during traversal. */
  path: string;
  /** Replacement value, including false. */
  value: unknown;
  /** Whether output must copy a caller-owned value before exposing it. */
  copy: boolean;
}

/** An allOf wrapper retaining siblings and appending prepared branches. */
export interface WrapOperation extends Omit<ReplaceOperation, 'kind' | 'copy'> {
  /** Wrapping preserves caller-owned sibling containers until materialization. */
  kind: 'wrap';
  /** A wrapper must isolate all retained caller-owned values. */
  copy: true;
  /** Removed reference keywords in source order. */
  removed: string[];
  /** Appended, already prepared branch values. */
  branches: unknown[];
}

/** Operations preserve traversal order; later operations supersede earlier descendants. */
export type OutputOperation = ReplaceOperation | WrapOperation;

/** Persistent path overlay used only while building an output. */
export interface OperationNode {
  /** Last replacement at this path supersedes older descendant operations. */
  replacement?: OutputOperation;
  /** Child overlays are keyed by decoded pointer tokens, including reserved names. */
  children: Map<string, OperationNode>;
}
