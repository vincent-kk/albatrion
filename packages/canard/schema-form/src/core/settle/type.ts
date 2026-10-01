import type { Distribution, SchemaNodeRecord } from '../record';
import type { BlueprintNode, EffectiveSchema } from '../blueprint';
import type { SchemaFormError } from '../../errors';
import type { DeriveState, DeriveTraceEntry } from './derive';

/** Origin of a write before calculation and transition phases. */
export type SchemaNodeWriteKind =
  | 'input'
  | 'callerPartial'
  | 'callerReplace'
  | 'load'
  | 'automatic';

/** Virtual child names indexed by their real sibling's host template and field. */
export type VirtualReferenceIndex = ReadonlyMap<BlueprintNode,
  ReadonlyMap<string, readonly string[]>>;

/** One synchronous write's work list and deferred failure. */
export interface SettlementContext<Self extends SchemaNodeRecord<Self>> {
  /** Live root reached through the record boundary. */
  root: Self;
  /** Emitted root reference from the preceding committed shape. */
  previousEmit: unknown;
  /** Binding context from the preceding committed shape. */
  previousContext?: Readonly<Record<string, unknown>>;
  /** Original caller target, excluded from refresh targets. */
  target: Self;
  /** Entry origin retained for later transition rules. */
  kind: SchemaNodeWriteKind;
  /** Public bit mask retained for the development trace entry. */
  option: number;
  /** Binding entry name when the settlement has no public write kind. */
  entryApi?: string;
  /** Declaration hosts whose context reads started this settlement. */
  contextOwners?: readonly string[];
  /** Whether this analysis contains any authored gate. */
  hasGates: boolean;
  /** Cached reverse references, absent for a blueprint without virtual nodes. */
  virtualReferenceIndex: VirtualReferenceIndex | null;
  /** Call-local suppression after explicit bits override the form default. */
  suppressAutomaticWrites: boolean;
  /** Load boundary whose current shape begins a new appearance lifetime. */
  loadScope?: Self;
  /** Whole-replacement boundary whose subtree keeps only the written raw per path. */
  replaceScope?: Self;
  /** Real sibling paths replaced by a caller write through a virtual node. */
  virtualReplacePaths?: string[];
  /** Nodes newly present after calculation or reset by this load. */
  entered: Set<Self>;
  /** Reused pending occurrences whose sources must remain visible to fills. */
  revived: Set<Self>;
  /** Entered then revived occurrences by latent key, built lazily and invalidated on rename. */
  enteredLatentKeys?: Map<string, Self[]>;
  /** Nodes detached from the previous shape during this call. */
  exited: Set<Self>;
  /** Nodes absent in a middle round and eligible for same-instance reentry. */
  pendingExits: Map<string, Self>;
  /** Array items removed by length, without exit policy. */
  perished: Set<Self>;
  /** Exits whose selecting gate threw and therefore cannot clear their subtree. */
  throwingGateExits?: Set<Self>;
  /** Incremented by each thrown gate evaluation to identify its selecting edge. */
  gateThrowVersion?: number;
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
  /** Reversible array shape changes made by automatic writes. */
  arrayStructureLog: { host: Self; previousItems: Self[];
    previousItemCount: number; previousExtras: unknown; restored?: boolean }[];
  /** Initial array lengths for non-load snapshot alignment. */
  arrayCounts: Map<Self, number>;
  /** Reindexed node and descendant paths, without event delivery. */
  pathChanges: { node: Self; previous: string; current: string }[];
  /** Nodes whose missing input received a default during this call. */
  filledNodes: Set<Self>;
  /** Whether shape updates belong to reversible automatic transition work. */
  inTransition: boolean;
  /** Previous latent entries changed during transition, indexed once per key. */
  latentAutomaticLog: Map<string, { present: boolean; value: unknown }>;
  /** Proper ancestor paths of current latent keys, rebuilt after map changes. */
  latentPrefixes?: Set<string>;
  /** Latent keys under their own path and each ancestor, built on first path lookup. */
  latentDescendantKeys?: Map<string, Set<string>>;
  /** Whether marking is currently applying a transition write. */
  automatic: boolean;
  /** True when the current transition round changed either state channel. */
  automaticChanged: boolean;
  /** Paths scheduled by the write and the blueprint dependency index. */
  dirtyPaths: Set<string>;
  /** Dirty descendant paths and their direct child names by ancestor. */
  dirtyChildrenByParent: Map<string, Map<string, string>>;
  /** Declaration-owner paths scheduled in this settlement by reverse dependencies or `@`. */
  dependencyOwnerPaths: Set<string>;
  /** Hosts whose declarations or children require a new gate/shape selection. */
  shapeDirtyPaths: Set<string>;
  /** Raw paths actually changed during marking. */
  changedRaw: Set<string>;
  /** Nodes whose calculated value or shape changed. */
  changedNodes: Set<Self>;
  /** Selecting hosts whose completed entries have not yet been assembled. */
  pendingOutputs?: Set<Self>;
  /** Nodes visited by calculation before final state-key publication. */
  stateDirtyNodes: Set<Self>;
  /** Effective schema before this write for nodes visited by a gate wheel. */
  originalSchemas: Map<string, EffectiveSchema>;
  /** Call-local baselines and consumed edges, allocated only for rule-bearing trees. */
  deriveState?: DeriveState<Self>;
  /** Number of applied derive write rounds throughout this settlement. */
  deriveRounds?: number;
  /** Development rule decisions grouped by round. */
  traceRounds?: DeriveTraceEntry[][];
  /** Last budget-exceeding attempt's rule names. */
  deriveBudgetRules?: readonly DeriveTraceEntry[];
  /** First error to throw after the commit boundary. */
  failure?: SchemaFormError;
  /** Cause assigned to the deferred failure. */
  cause?: 'expression' | 'injectTarget' | 'writeShape' | 'sharedConflict' | 'budget';
  /** Exhausted host rounds handed to the later budget phase. */
  hostWheelExceeded?: number;
  /** The exhausted transition or recursion budget, when applicable. */
  exceededBudget?: 'hostWheel' | 'derive' | 'transition' | 'recursion';
  /** Number of rounds spent at the exhausted budget. */
  iterations?: number;
}
