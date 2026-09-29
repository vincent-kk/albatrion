import type { SchemaNodeRecord } from '../record';
import type { EffectiveSchema } from '../blueprint';
import type { SchemaFormError } from '../../errors';

/** Origin of a write before calculation and transition phases. */
export type SchemaNodeWriteKind =
  | 'input'
  | 'callerPartial'
  | 'callerReplace'
  | 'load'
  | 'automatic';

/** One synchronous write's work list and deferred failure. */
export interface SettlementContext<Self extends SchemaNodeRecord<Self>> {
  /** Live root reached through the record boundary. */
  root: Self;
  /** Original caller target, excluded from refresh targets. */
  target: Self;
  /** Entry origin retained for later transition rules. */
  kind: SchemaNodeWriteKind;
  /** Paths scheduled by the write and the blueprint dependency index. */
  dirtyPaths: Set<string>;
  /** Hosts whose declarations or children require a new gate/shape selection. */
  shapeDirtyPaths: Set<string>;
  /** Raw paths actually changed during marking. */
  changedRaw: Set<string>;
  /** Nodes whose calculated value or shape changed. */
  changedNodes: Set<Self>;
  /** Effective schema before this write for nodes visited by a gate wheel. */
  originalSchemas: Map<string, EffectiveSchema>;
  /** First error to throw after the commit boundary. */
  failure?: SchemaFormError;
  /** Cause assigned to the deferred failure. */
  cause?: 'expression' | 'sharedConflict' | 'budget';
  /** Exhausted host rounds handed to the later budget phase. */
  hostWheelExceeded?: number;
}
