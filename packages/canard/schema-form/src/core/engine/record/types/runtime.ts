import type {
  FormErrorRecord,
  FormErrorReporter,
  FormWarningCode,
} from '../../../../errors';
import type {
  Blueprint,
  BlueprintNode,
  BlueprintSchemaType,
  EffectiveSchema,
} from '../../blueprint';
import type { DeclarationLayer } from '../../types/controls';
import type { ValidationMode } from '../../types/state';
import type { FieldNodeWriteKind, WriteOption } from '../../types/value';
import type { PathKeyedMap } from '../../utils/pathIndex/PathKeyedMap';
import type { PathKeyedSet } from '../../utils/pathIndex/PathKeyedSet';
import type { FieldNodeFactory } from './behavior';
import type { FieldNodeDelivery } from './record';

/** Tree-local reverse watch paths used by commit delivery marking. */
interface FieldNodeWatchDeliveryIndex {
  /** Live nodes with at least one resolved watch path. */
  readonly allNodes: ReadonlySet<unknown>;
  /** Nodes whose effective watch list reads the context slot. */
  readonly contextNodes: ReadonlySet<unknown>;
  /** Replace one live node's effective resolved watch paths. */
  update(node: unknown, paths: readonly string[]): void;
  /** Forget an occurrence that left the shape or lost its watch list. */
  remove(node: unknown): void;
  /** Add watchers of path ancestors and descendants to the candidate set. */
  affected(path: string, candidates: Set<unknown>): void;
}

/** Settlement health for the most recent or first degraded commit. */
interface FieldNodeDiagnostics {
  /** Current settlement health. */
  status: 'stable' | 'degraded';
  /** Reason for a degraded commit. */
  cause?: SettlementFailureCause;
  /** Budget whose limit stopped settlement. */
  exceededBudget?: SettlementBudget;
  /** Number of iterations at the exceeded limit. */
  iterations?: number;
  /** Commit at which degradation was first recorded. */
  commit?: number;
}

/** Classification, document position, and retained exit decisions of a latent occurrence. */
interface LatentRawMetadata {
  readonly path: string;
  readonly blueprintNode: BlueprintNode;
  readonly order: readonly number[];
  /** Last-live explicit exit decisions retained after rule baselines are pruned. */
  readonly exitLayers?: readonly {
    readonly layer: DeclarationLayer;
    readonly clear: boolean;
  }[];
}

/** Last published item and sort position for one enumerable latent occurrence. */
interface InactiveValueEntryMemo {
  readonly value: unknown;
  readonly order: readonly number[];
  readonly entry: Readonly<{ path: string; value: unknown }>;
}

/** Root-owned settlement data reached through a record's runtime. */
interface FieldNodeRootRuntimeState {
  /** Form-level load source, read at node paths. */
  loadSnapshot: unknown;
  /** Per-kind latent leaf raw or a host's own frozen raw and undeclared values. */
  latentRaw: PathKeyedMap<unknown>;
  /** Whether latent sources changed since the last inactive-value publication. */
  latentRawDirty?: boolean;
  /** Latent occurrence shape and document position, keyed like latentRaw. */
  latentRawMetadata?: PathKeyedMap<LatentRawMetadata>;
  /** Current paths whose raw values miss their effective types. */
  misfitPaths: PathKeyedSet;
  /** Commit-scoped inactive value lists keyed by node path. */
  inactiveValuesMemo: PathKeyedMap<readonly { path: string; value: unknown }[]>;
  /** Published latent item objects retained across unrelated commits. */
  inactiveValueEntries?: PathKeyedMap<InactiveValueEntryMemo>;
}

/** Last committed reads retained for one node reference after it exits. */
interface DetachedFieldNodeReads {
  readonly errors: readonly { readonly dataPath: string }[];
  readonly misfit: boolean;
  readonly misfits: readonly string[];
  readonly inactiveValues: readonly { path: string; value: unknown }[];
  readonly defaultValue: unknown;
  readonly visible: boolean;
  readonly readOnly: boolean;
  readonly disabled: boolean;
}

/** Structured warning emitted when a committed raw value misses its effective type. */
export interface MisfitRecord {
  readonly level: 'warning';
  readonly code: typeof FormWarningCode.Misfit;
  readonly path: string;
  readonly expected: {
    readonly schemaType: BlueprintSchemaType;
    readonly nullable: boolean;
    readonly effective: BlueprintSchemaType;
  };
  readonly received:
    | 'string'
    | 'number'
    | 'integer'
    | 'nonFinite'
    | 'boolean'
    | 'null'
    | 'object'
    | 'array'
    | 'other';
  readonly reason: 'unconvertible' | 'ambiguous';
  readonly candidates?: readonly string[];
  readonly source: MisfitSource;
}

/** One host write's input and replacement mode for child distribution. */
export interface Distribution {
  /** Interpreted input distributed from this host during the current write. */
  readonly input: unknown;
  /** Whether absent child names are replaced as well. */
  readonly whole: boolean;
  /** Whether this distribution was an automatic transition write. */
  readonly automatic: boolean;
}

/** Reusable settlement work containers bound to one tree's node type. */
export interface SettlementScratch<Self> {
  /** Whether a synchronous settlement currently owns these containers. */
  inUse: boolean;
  /** Occurrences that first appeared during this settlement. */
  entered: Set<Self>;
  /** Pending occurrences reused during a later host wheel. */
  revived: Set<Self>;
  /** Previously committed occurrences absent from the final shape. */
  exited: Set<Self>;
  /** Temporarily absent occurrences, addressed by path and blueprint kind. */
  pendingExits: Map<string, Self>;
  /** Array items removed by length rather than declaration gating. */
  perished: Set<Self>;
  /** Active declaration choices waiting for commit. */
  selectedDeclarationIds: Map<Self, readonly number[]>;
  /** Original caller and fill inputs retained for effective-list interpretation. */
  writtenInputs: Map<Self, unknown>;
  /** Host writes to distribute to declared descendants. */
  distributedInputs: Map<Self, Distribution>;
  /** Wrong-kind hosts considered for conditional caller clearing. */
  wrongKindHosts: Set<Self>;
  /** Previous state of each reversible automatic node write. */
  automaticLog: {
    node: Self;
    previousRaw: unknown;
    previousExtras: unknown;
    previousDistributed?: Distribution;
  }[];
  /** Ordered array shapes before reversible automatic writes. */
  arrayStructureLog: {
    host: Self;
    previousItems: Self[];
    previousItemCount: number;
    previousExtras: unknown;
    restored?: boolean;
  }[];
  /** First array length observed in this settlement for snapshot alignment. */
  arrayCounts: Map<Self, number>;
  /** Paths changed before settlement, retained for later UpdatePath delivery. */
  pathChanges: { node: Self; previous: string; current: string }[];
  /** Nodes whose absent source received a transition fill. */
  filledNodes: Set<Self>;
  /** Previous values of latent entries touched in a transition. */
  latentAutomaticLog: Map<string, { present: boolean; value: unknown }>;
  /** Paths scheduled for recalculation. */
  dirtyPaths: Set<string>;
  /** Dirty descendant paths and their direct child names by ancestor. */
  dirtyChildrenByParent: Map<string, Map<string, string>>;
  /** Declaration-owner paths scheduled by reverse dependencies or context reads. */
  dependencyOwnerPaths: Set<string>;
  /** Hosts scheduled for a new shape selection. */
  shapeDirtyPaths: Set<string>;
  /** Paths whose own source channels changed. */
  changedRaw: Set<string>;
  /** Explicit caller changes retained for Source B. */
  explicitRaw: Set<string>;
  /** Nodes whose source or calculated result changed. */
  changedNodes: Set<Self>;
  /** Nodes visited by calculation whose final state keys need publication. */
  stateDirtyNodes: Set<Self>;
  /** Effective schemas recorded before this settlement. */
  originalSchemas: Map<string, EffectiveSchema>;
}

/** Minimal per-tree slots consumed by the first settlement engine. */
export interface FieldNodeRuntime<Self> extends FieldNodeRootRuntimeState {
  /** Number of current-shape nodes with a truthy value for each state key. */
  globalStateCounts: Map<string, number>;
  /** Stable aggregate of keys whose count is positive. */
  globalState: Readonly<Record<string, true>>;
  /** Pending events consumed by the later dispatcher. */
  deliveries?: Set<Self>;
  /** Nodes with revision bits marked before the commit visitor reaches them. */
  revisionNodes?: Set<Self>;
  /** Live reverse watch dependencies, allocated on the first watched node. */
  deliveryWatchIndex?: FieldNodeWatchDeliveryIndex;
  /** Paths captured at value/state mutations and consumed by commit watch lookup. */
  deliveryAffectedPaths?: Set<string>;
  /** Last diagnostics reference observed by delivery marking. */
  deliveredDiagnostics?: FieldNodeDiagnostics;
  /** Context reference last observed by delivery marking. */
  deliveredContext?: Readonly<Record<string, unknown>>;
  /** Public entry depth consumed by the later dispatcher. */
  entryDepth?: number;
  /** Feedback waves already produced by the current outer entry. */
  feedbackBudget?: number;
  /** Current nested onChange callback count. */
  onChangeBudget?: number;
  /** Root that owns an entry, which can change during a rebuilt reset. */
  chainRoot?: Self;
  /** Replacement root used to finish a rebuilt open entry. */
  adoptedRoot?: unknown;
  /** Emitted root reference observed before this entry. */
  chainInitialEmit?: unknown;
  /** Failures retained in occurrence order until the chain finishes. */
  chainErrors?: unknown[];
  /** Error and warning occurrences in their actual chain order. */
  chainOccurrences?: (
    | { kind: 'error'; error: unknown }
    | { kind: 'record'; record: FormErrorRecord }
  )[];
  /**
   * Stack of enclosing chains' failure collections, innermost first; `outer` links the next.
   * A nested entry pushes on enter and pops on exit, so each failure is recorded once at its chain head.
   */
  enclosingChain?: {
    readonly errors: unknown[];
    readonly occurrences: NonNullable<
      FieldNodeRuntime<Self>['chainOccurrences']
    >;
    readonly outer?: FieldNodeRuntime<Self>['enclosingChain'];
  };
  /** True only while this form invokes its error reporter. */
  reportingErrors?: boolean;
  /** Schema locations supplied by a binding after reference-only reset rebuilding. */
  rebuiltReferenceSchemaPaths?: readonly string[];
  /** Per-node subscribers, allocated only for a subscribed tree. */
  listeners?: Map<unknown, Set<(event: FieldNodeDelivery) => void>>;
  /** Subscriber currently producing a delivery callback. */
  currentListener?: (event: FieldNodeDelivery) => void;
  /** Feedback producers already stopped at this chain's wave budget. */
  feedbackBlockedListeners?: Set<(event: FieldNodeDelivery) => void>;
  /** Whether this chain already recorded its feedback limit failure. */
  feedbackLimitReported?: boolean;
  /** Number of active nested batch callbacks. */
  batchDepth?: number;
  /** Caller writes postponed until the outer batch callback finishes. */
  batchWrites?: {
    node: Self;
    value: unknown;
    option: WriteOption;
    source?: 'input' | 'automatic';
  }[];
  /** Mount defers validation until the binding's ready effect. */
  deferMountValidation?: boolean;
  /** External errors awaiting the replacement tree's first committed shape. */
  adoptedExternalErrors?: Map<string, readonly { dataPath: string }[]>;
  /** Reset scopes requiring validation even with an unchanged root emit. */
  validationTargets?: Set<Self>;
  /** Non-settlement events coalesced independently from commit deliveries. */
  queuedNonSettleEvents?: Set<Self>;
  /** Whether a non-settlement wave is draining, preventing listener reentry. */
  flushingQueuedEvents?: boolean;
  /** Whether interaction flags changed since the last outer delivery. */
  stateChanged?: boolean;
  /** Warning identities already reported for this tree. */
  warningKeys?: Set<string>;
  /** Warnings held until the public entry commits and finishes delivery. */
  pendingWarningRecords?: Map<string, FormErrorRecord>;
  /** Data-path ancestor to warning keys, for change-proportional moves/pruning. */
  warningKeysByPath?: Map<string, Set<string>>;
  /** Guard failures awaiting the current public entry's final delivery. */
  guardFailureRecords?: Map<string, FormErrorRecord>;
  /** Failed guards already reported by this consuming tree. */
  reportedGuardFailures?: Set<string>;
  /** Development mount currently defers guard failures until its commit. */
  mountingGuardPass?: boolean;
  /** Host observer for structured failures and warnings. */
  errorReporter?: FormErrorReporter;
  /** Selected validation engine, narrowed by the validation layer. */
  validator?: unknown;
  /** Form validation trigger policy. */
  validationMode?: ValidationMode;
  /** Host callback after a completed entry changes the emitted root value. */
  onChange?: (value: unknown) => void;
  /** Host callback after an entry changes interaction flags. */
  onStateChange?: () => void;
  /** Most recent validation request/result version. */
  validationStamp?: number;
  /** Stamp of the latest queued write-triggered request. */
  validationRequestStamp?: number;
  /** Root external issues followed by the ordered whole-schema validator issues. */
  globalErrors?: readonly { dataPath: string }[];
  /** Latest ordered validator issues, including ownerless and hidden issues. */
  routedValidationErrors?: readonly { dataPath: string }[];
  /** Last displayed validator issues, separate from external errors. */
  validationErrors?: Map<unknown, readonly unknown[]>;
  /** Nodes whose displayed validator issues changed in the last result. */
  validationChangedNodes?: Set<Self>;
  /** True after this load discovers that whole-schema compilation failed. */
  validationUnavailable?: boolean;
  /** Whether this load has reported its one whole-schema compilation failure. */
  validationCompileReported?: boolean;
  /** Dispatcher-owned path for asynchronous execution and delivery failures. */
  reportValidationFailure?: (failure: unknown) => void;
  /** True while one microtask is queued to run the latest request. */
  validationQueued?: boolean;
  /** Subtree scopes merged into the next one-per-commit validation run. */
  validationPendingTargets?: Set<Self>;
  /** True after a routing replaced the routed list, until the validation wave publishes it. */
  validationListChanged?: boolean;
  /** Most recent result and its commit number. */
  validationResult?: {
    readonly commit: number;
    readonly issues: readonly unknown[];
  };
  /** Stable merged reads of validator and external issues. */
  combinedErrors?: Map<
    unknown,
    {
      readonly external?: readonly unknown[];
      readonly validation?: readonly unknown[];
      readonly errors: readonly unknown[];
    }
  >;
  /** External issues keyed by live node. */
  nodeErrors?: Map<unknown, readonly { dataPath: string }[]>;
  /** Non-root nodes whose external issues changed since the last root rebuild; rebuilt once at exit or before the next delivery wave. */
  pendingExternalErrorNodes?: Set<unknown>;
  /** Issue references each non-root node last contributed to the root list; adoption fills it from the handed-over lists. */
  externalContributions?: Map<unknown, readonly { dataPath: string }[]>;
  /** Form context shared by every occurrence and expression in this tree; the factory supplies an empty object when none is given. */
  context: Readonly<Record<string, unknown>>;
  /** Last committed expression inputs, keyed by live authored rule occurrence. */
  committedRuleValues?: PathKeyedMap<unknown>;
  /** Committed rule keys indexed by their source path for bounded pruning. */
  committedRuleKeysBySource?: Map<string, Set<string>>;
  /** Committed rule keys indexed by live value target for exited-subtree pruning. */
  committedRuleKeysByTarget?: Map<string, Set<string>>;
  /** Last development settlement, replaced rather than accumulated. */
  settlementTrace?: {
    /** Entry API and public write option bits. */
    readonly entry: {
      readonly api: SettlementEntryApi;
      readonly option: number;
    };
    /** Rule decisions grouped by evaluation round. */
    readonly rounds: readonly (readonly {
      readonly phase: string;
      readonly kind: string;
      readonly sourcePath: string;
      readonly targetPath: string;
      readonly previousValue: unknown;
      readonly nextValue: unknown;
      readonly result: string;
    }[])[];
    /** Last attempted rule list when derive exceeded its budget. */
    readonly budget?: readonly {
      readonly kind: string;
      readonly sourcePath: string;
      readonly targetPath: string;
      readonly result: string;
    }[];
  };
  /** Form default for automatic writes, overridden by a call's explicit bits. */
  disableAutomaticWrites?: boolean;
  /** Form default for clearing raw when a node leaves the shape. */
  unsetOnInactive?: boolean;
  /** Last committed active declarations keyed by the occurrence path and kind. */
  committedDeclarationIds?: PathKeyedMap<readonly number[]>;
  /** Required real analysis shared by this tree and its settlement engine. */
  blueprint: Blueprint;
  /** Number of completed synchronous settlement calls. */
  commitNumber?: number;
  /** Changed non-load paths in the last settlement, excluding the written input. */
  refreshTargets?: Set<string>;
  /** Newly lit misfit records in the last committed batch. */
  misfitRecords?: readonly MisfitRecord[];
  /** Commit-scoped subtree misfit path lists. */
  misfitsMemo?: PathKeyedMap<{
    commit: number;
    paths: readonly string[];
  }>;
  /** Frozen last-commit reads for departed references, allocated on first exit. */
  detachedReads?: WeakMap<object, DetachedFieldNodeReads>;
  /** Stable watch path results for each node within one completed commit. */
  watchValuesMemo?: WeakMap<
    object,
    { commit: number; values: readonly unknown[] }
  >;
  /** Settlement health retained until a form-level load. */
  diagnostics: FieldNodeDiagnostics;
  /** Single node creator used throughout this tree. */
  nodeFactory: FieldNodeFactory<Self>;
  /** Lazily retained work containers for non-reentrant settlement calls. */
  settlementScratch?: SettlementScratch<Self>;
}

/** First failure that degraded a settlement, independent of a later budget exhaustion. */
export type SettlementFailureCause =
  | 'budget'
  | 'expression'
  | 'injectTarget'
  | 'writeShape'
  | 'sharedConflict';

/** Budget whose limit stopped a settlement. */
export type SettlementBudget =
  | 'hostWheel'
  | 'derive'
  | 'transition'
  | 'recursion';

/** Entry that started a settlement: a write kind, or a binding entry without one. */
export type SettlementEntryApi = FieldNodeWriteKind | 'setContext';

/** Write that produced a misfit: a write kind, an automatic fill, or a gate change that re-read the raw. */
export type MisfitSource = FieldNodeWriteKind | 'fill' | 'gate';
