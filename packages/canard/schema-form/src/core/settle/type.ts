import type { Distribution, SchemaNodeRecord } from '../record';
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
  /** Whether this analysis contains any authored gate. */
  hasGates: boolean;
  /** Call-local suppression after explicit bits override the form default. */
  suppressAutomaticWrites: boolean;
  /** Load boundary whose current shape begins a new appearance lifetime. */
  loadScope?: Self;
  /** Whole-replacement boundary whose subtree keeps only the written raw per path. */
  replaceScope?: Self;
  /** Nodes newly present after calculation or reset by this load. */
  entered: Set<Self>;
  /** Reused pending occurrences whose sources must remain visible to fills. */
  revived: Set<Self>;
  /** Nodes detached from the previous shape during this call. */
  exited: Set<Self>;
  /** Nodes absent in a middle round and eligible for same-instance reentry. */
  pendingExits: Map<string, Self>;
  /** Active declaration choices published only after this call commits. */
  selectedDeclarationIds: Map<Self, readonly number[]>;
  /** Original inputs retained for effective-list interpretation. */
  writtenInputs: Map<Self, unknown>;
  /** Host inputs that must reach children during this settlement. */
  distributedInputs: Map<Self, Distribution>;
  /** Wrong-kind branch hosts eligible for conditional caller clearing. */
  wrongKindHosts: Set<Self>;
  /** Previous state for each automatic write, restored in reverse order. */
  automaticLog: { node: Self; previousRaw: unknown; previousExtras: unknown;
    previousDistributed?: Distribution }[];
  /** Nodes whose missing input received a default during this call. */
  filledNodes: Set<Self>;
  /** Whether shape updates belong to reversible automatic transition work. */
  inTransition: boolean;
  /** Previous latent entries changed during transition, indexed once per key. */
  latentAutomaticLog: Map<string, { present: boolean; value: unknown }>;
  /** Proper ancestor paths of current latent keys, rebuilt after map changes. */
  latentPrefixes?: Set<string>;
  /** Whether marking is currently applying a transition write. */
  automatic: boolean;
  /** True when the current transition round changed either state channel. */
  automaticChanged: boolean;
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
  /** The exhausted transition or recursion budget, when applicable. */
  exceededBudget?: 'hostWheel' | 'transition' | 'recursion';
  /** Number of rounds spent at the exhausted budget. */
  iterations?: number;
}
