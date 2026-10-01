import type {
  BlueprintChildEntry,
  Blueprint,
  BlueprintNode,
  BlueprintNodeKind,
  BlueprintSchemaType,
  EffectiveSchema,
  SchemaTypeName,
} from '../blueprint';
import type { NodeStateFlags, ValidationMode } from '../types/state';
import type { SetValueOption } from '../types/value';
import type { FormErrorRecord, FormErrorReporter } from '../../errors';

/** Shared ledger until an occurrence first receives a committed event. */
export const EMPTY_REVISION_LEDGER: Readonly<Record<number, number>> = Object.freeze({});

/** One pending node event with values indexed by their event bits. */
export interface SchemaNodeDelivery {
  /** Combined event bits waiting for dispatch. */
  type: number;
  /** Latest event-specific values for this wave. */
  payload?: Partial<Record<number, unknown>>;
  /** Latest event-specific metadata for this wave. */
  options?: Partial<Record<number, unknown>>;
}

/** Last committed observations needed to mark the next delivery. */
interface SchemaNodeDeliverySnapshot<Self> {
  /** Path observed after the preceding commit. */
  readonly path: string;
  /** Calculated value before output projection. */
  readonly local: unknown;
  /** Projected value available to consumers. */
  readonly emit: unknown;
  /** Direct child collection reference. */
  readonly children: readonly Self[] | null;
  /** Gate result used by the computed-property bit. */
  readonly active: boolean;
  /** Final local visibility. */
  readonly visible: boolean;
  /** Final local read-only state. */
  readonly readOnly: boolean;
  /** Final local disabled state. */
  readonly disabled: boolean;
  /** Interaction state object before a possible reset. */
  readonly interactionState: NodeStateFlags;
  /** Memoized effective schema reference. */
  readonly schema: EffectiveSchema;
  /** Committed watched values for reference comparison. */
  readonly watchValues: readonly unknown[];
}

/** Tree-local reverse watch paths used by commit delivery marking. */
interface SchemaNodeWatchDeliveryIndex {
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

/** The fixed node layout implemented by every node kind. */
export interface SchemaNodeRecord<Self> {
  /** Shared calculation row selected for this node's kind and strategy. */
  readonly behavior: Behavior<Self>;
  /** Per-tree services and settlement records. */
  readonly runtime: SchemaNodeRuntime<Self>;
  /** Immutable analysis template for this occurrence. */
  readonly blueprintNode: BlueprintNode;
  /** Current structural parent, absent only at the root. */
  parent: Self | null;
  /** Live root, including when this node has detached. */
  rootNode: Self;
  /** Unescaped name within the parent. */
  name: string;
  /** JSON Pointer encoded name within the parent. */
  escapedName: string;
  /** Canonical absolute path of this occurrence. */
  path: string;
  /** Number of structural edges from the root. */
  depth: number;
  /** Whether the current declaration requires this node. */
  required: boolean;
  /** Whether the fixed type permits null. */
  readonly nullable: boolean;
  /** Stable type restriction retained from blueprint analysis. */
  readonly schemaType: BlueprintSchemaType;
  /** Direct children in the last committed shape, keyed by their names. */
  structure: Record<string, Self> | null;
  /** Stored public child array for the last committed shape. */
  children: readonly Self[] | null;
  /** Interpreted terminal source or a branch's non-plain source. */
  raw: unknown;
  /** Undeclared object keys retained in their incoming own-key order. */
  extras: unknown;
  /** Result of the current node gate. */
  active: boolean;
  /** Local visibility after all active state declarations are combined. */
  visible: boolean;
  /** Local read-only result, including standard schema readOnly. */
  readOnly: boolean;
  /** Local disabled result after all active state declarations are combined. */
  disabled: boolean;
  /** Calculated local value before output projection. */
  local: unknown;
  /** Calculated output value. */
  emit: unknown;
  /** Merged effective schema for the active declarations. */
  schema: EffectiveSchema;
  /** Stored interaction flags updated by shallow patches. */
  interactionState: NodeStateFlags;
  /** Per-bit commit counts, allocated on the first delivery. */
  revisionLedger: Readonly<Record<number, number>>;
  /** Whether this reference has left the live shape. */
  detached: boolean;
}

/** Read-only type candidates used by a calculation row. */
export interface UnionSpec {
  /** Non-null allowed types in declaration order. */
  readonly kinds:
    | Exclude<SchemaTypeName, 'null'>
    | readonly Exclude<SchemaTypeName, 'null'>[];
  /** Bit mask of the same allowed types. */
  readonly mask: number;
  /** Whether null remains an allowed input. */
  readonly nullable: boolean;
}

/** Pure calculation slots shared across nodes of one kind and strategy. */
export interface Behavior<Self = unknown> {
  /** Interpret caller input under the current allowed types. */
  interpret(input: unknown, spec: UnionSpec): unknown;
  /** Assemble the current child values without committing them. */
  assemble<Node extends Self>(node: SchemaNodeRecord<Node>, children: readonly Node[]): unknown;
  /** Project a local value into the outgoing value. */
  project<Node extends Self>(node: SchemaNodeRecord<Node>, local: unknown): unknown;
  /** Return a completed input string, or undefined when there is no write. */
  finishInput<Node extends Self>(node: SchemaNodeRecord<Node>): string | undefined;
  /** Describe children to be created by the caller. */
  declareChildren<Node extends Self>(node: SchemaNodeRecord<Node>): readonly BlueprintChildEntry[];
  /** Stable dispatch kind of this row. */
  readonly type: BlueprintNodeKind;
  /** Fixed branch or terminal shape of this row. */
  readonly strategy: 'branch' | 'terminal';
}

/** Per-tree creation callback supplied by the composition root. */
export type SchemaNodeFactory<Self> = (
  entry: BlueprintChildEntry | BlueprintNode,
  parent: Self | null,
  runtime: SchemaNodeRuntime<Self>,
) => Self;

/** Settlement health for the most recent or first degraded commit. */
interface SchemaNodeDiagnostics {
  /** Current settlement health. */
  status: 'stable' | 'degraded';
  /** Reason for a degraded commit. */
  cause?: 'budget' | 'expression' | 'injectTarget' | 'writeShape' | 'sharedConflict';
  /** Budget whose limit stopped settlement. */
  exceededBudget?: 'hostWheel' | 'derive' | 'transition' | 'recursion';
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
    readonly layer: 'node' | 'children' | 'fragment';
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
interface SchemaNodeRootRuntimeState {
  /** Form-level load source, read at node paths. */
  loadSnapshot: unknown;
  /** Per-kind latent leaf raw or a host's own frozen raw and extras. */
  latentRaw: Map<string, unknown>;
  /** Whether latent sources changed since the last inactive-value publication. */
  latentRawDirty?: boolean;
  /** Latent occurrence shape and document position, keyed like latentRaw. */
  latentRawMetadata?: Map<string, LatentRawMetadata>;
  /** Current paths whose raw values miss their effective types. */
  typeMismatchPaths: Set<string>;
  /** Commit-scoped inactive value lists keyed by node path. */
  inactiveValuesMemo: Map<string, readonly { path: string; value: unknown }[]>;
  /** Published latent item objects retained across unrelated commits. */
  inactiveValueEntries?: Map<string, InactiveValueEntryMemo>;
}

/** Last committed reads retained for one node reference after it exits. */
interface DetachedSchemaNodeReads {
  readonly typeMismatch: boolean;
  readonly typeMismatches: readonly string[];
  readonly inactiveValues: readonly { path: string; value: unknown }[];
  readonly defaultValue: unknown;
  readonly visible: boolean;
  readonly readOnly: boolean;
  readonly disabled: boolean;
}

/** Structured warning emitted when a committed raw value misses its effective type. */
export interface TypeMismatchRecord {
  readonly level: 'warning';
  readonly code: string;
  readonly path: string;
  readonly expected: {
    readonly schemaType: BlueprintSchemaType;
    readonly nullable: boolean;
    readonly effective: BlueprintSchemaType;
  };
  readonly received: 'string' | 'number' | 'integer' | 'nonFinite' | 'boolean' |
    'null' | 'object' | 'array' | 'other';
  readonly reason: 'unconvertible' | 'ambiguous';
  readonly candidates?: readonly string[];
  readonly source: string;
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
  /** Active declaration choices waiting for commit. */
  selectedDeclarationIds: Map<Self, readonly number[]>;
  /** Original caller and fill inputs retained for effective-list interpretation. */
  writtenInputs: Map<Self, unknown>;
  /** Host writes to distribute to declared descendants. */
  distributedInputs: Map<Self, Distribution>;
  /** Wrong-kind hosts considered for conditional caller clearing. */
  wrongKindHosts: Set<Self>;
  /** Previous state of each reversible automatic node write. */
  automaticLog: { node: Self; previousRaw: unknown; previousExtras: unknown;
    previousDistributed?: Distribution }[];
  /** Nodes whose absent source received a transition fill. */
  filledNodes: Set<Self>;
  /** Previous values of latent entries touched in a transition. */
  latentAutomaticLog: Map<string, { present: boolean; value: unknown }>;
  /** Paths scheduled for recalculation. */
  dirtyPaths: Set<string>;
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
export interface SchemaNodeRuntime<Self> extends SchemaNodeRootRuntimeState {
  /** Number of current-shape nodes with a truthy value for each state key. */
  globalStateCounts: Map<string, number>;
  /** Stable aggregate of keys whose count is positive. */
  globalState: Readonly<Record<string, true>>;
  /** Pending events consumed by the later dispatcher. */
  deliveries?: Map<unknown, SchemaNodeDelivery>;
  /** Last committed node observations for change detection. */
  deliverySnapshots?: Map<unknown, SchemaNodeDeliverySnapshot<unknown>>;
  /** Live reverse watch dependencies, allocated on the first watched node. */
  deliveryWatchIndex?: SchemaNodeWatchDeliveryIndex;
  /** Last diagnostics reference observed by delivery marking. */
  deliveredDiagnostics?: SchemaNodeDiagnostics;
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
    { kind: 'error'; error: unknown } | { kind: 'record'; record: FormErrorRecord }
  )[];
  /** True only while this form invokes its error reporter. */
  reportingErrors?: boolean;
  /** Schema locations supplied by a binding after reference-only reset rebuilding. */
  rebuiltReferenceSchemaPaths?: readonly string[];
  /** Per-node subscribers, allocated only for a subscribed tree. */
  listeners?: Map<unknown, Set<(event: SchemaNodeDelivery) => void>>;
  /** Subscriber currently producing a delivery callback. */
  currentListener?: (event: SchemaNodeDelivery) => void;
  /** Feedback producers already stopped at this chain's wave budget. */
  feedbackBlockedListeners?: Set<(event: SchemaNodeDelivery) => void>;
  /** Whether this chain already recorded its feedback limit failure. */
  feedbackLimitReported?: boolean;
  /** Number of active nested batch callbacks. */
  batchDepth?: number;
  /** Caller writes postponed until the outer batch callback finishes. */
  batchWrites?: { node: Self; value: unknown; option: SetValueOption }[];
  /** Reset scopes requiring validation even with an unchanged root emit. */
  validationTargets?: Set<Self>;
  /** Validation request seam filled by the validation unit. */
  requestValidation?: (node: Self) => void;
  /** Whether a listener or error handler is currently receiving delivery. */
  delivering?: boolean;
  /** Events marked outside settlement for the next dispatcher wave. */
  queuedEvents?: Map<unknown, SchemaNodeDelivery>;
  /** Non-settlement events coalesced independently from commit deliveries. */
  queuedNonSettleEvents?: Map<unknown, SchemaNodeDelivery>;
  /** Whether a non-settlement wave is draining, preventing listener reentry. */
  flushingQueuedEvents?: boolean;
  /** Whether interaction flags changed since the last outer delivery. */
  stateChanged?: boolean;
  /** Warning identities already reported for this tree. */
  warningKeys?: Set<string>;
  /** Warnings held until the public entry commits and finishes delivery. */
  pendingWarningRecords?: Map<string, FormErrorRecord>;
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
  /** Latest ordered whole-schema issues, including ownerless and hidden issues. */
  globalErrors?: readonly { dataPath: string }[];
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
  /** Most recent result and its commit number. */
  validationResult?: { readonly commit: number; readonly issues: readonly unknown[] };
  /** Stable merged reads of validator and external issues. */
  combinedErrors?: Map<unknown, {
    readonly external?: readonly unknown[];
    readonly validation?: readonly unknown[];
    readonly errors: readonly unknown[];
  }>;
  /** Validation and external issues keyed by live node. */
  nodeErrors?: Map<unknown, readonly unknown[]>;
  /** Form context shared by every occurrence and expression in this tree. */
  context?: Readonly<Record<string, unknown>>;
  /** Last committed expression inputs, keyed by live authored rule occurrence. */
  committedRuleValues?: Map<string, unknown>;
  /** Committed rule keys indexed by their source path for bounded pruning. */
  committedRuleKeysBySource?: Map<string, Set<string>>;
  /** Committed rule keys indexed by live value target for exited-subtree pruning. */
  committedRuleKeysByTarget?: Map<string, Set<string>>;
  /** Last development settlement, replaced rather than accumulated. */
  settlementTrace?: {
    /** Entry API and public write option bits. */
    readonly entry: { readonly api: string; readonly option: number };
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
  committedDeclarationIds?: Map<string, readonly number[]>;
  /** Required real analysis shared by this tree and its settlement engine. */
  blueprint: Blueprint;
  /** Number of completed synchronous settlement calls. */
  commitNumber?: number;
  /** Last non-load write's refresh paths, committed as one batch. */
  refreshTargets?: Set<string>;
  /** Newly lit mismatch records in the last committed batch. */
  typeMismatchRecords?: readonly TypeMismatchRecord[];
  /** Commit-scoped subtree mismatch path lists. */
  typeMismatchesMemo?: Map<string, { commit: number; paths: readonly string[] }>;
  /** Frozen last-commit reads for departed references, allocated on first exit. */
  detachedReads?: WeakMap<object, DetachedSchemaNodeReads>;
  /** Stable watch path results for each node within one completed commit. */
  watchValuesMemo?: WeakMap<object, { commit: number; values: readonly unknown[] }>;
  /** Settlement health retained until a form-level load. */
  diagnostics: SchemaNodeDiagnostics;
  /** Single node creator used throughout this tree. */
  nodeFactory: SchemaNodeFactory<Self>;
  /** Lazily retained work containers for non-reentrant settlement calls. */
  settlementScratch?: SettlementScratch<Self>;
}
