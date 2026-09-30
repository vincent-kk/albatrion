import type {
  BlueprintChildEntry,
  Blueprint,
  BlueprintGate,
  BlueprintNode,
  BlueprintNodeKind,
  BlueprintSchemaType,
  EffectiveSchema,
  SchemaTypeName,
} from '../blueprint';
import type { NodeStateFlags } from '../types/state';

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
  /** Calculated local value before output projection. */
  local: unknown;
  /** Calculated output value. */
  emit: unknown;
  /** Merged effective schema for the active declarations. */
  schema: EffectiveSchema;
  /** Interaction flags updated by shallow patches. */
  state: NodeStateFlags;
  /** Last committed revision of this node. */
  revision: number;
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
  cause?: 'budget' | 'expression' | 'injectTarget' | 'sharedConflict';
  /** Budget whose limit stopped settlement. */
  exceededBudget?: 'hostWheel' | 'derive' | 'transition' | 'recursion';
  /** Number of iterations at the exceeded limit. */
  iterations?: number;
  /** Commit at which degradation was first recorded. */
  commit?: number;
}

/** Classification and document position of one latent occurrence. */
interface LatentRawMetadata {
  readonly path: string;
  readonly blueprintNode: BlueprintNode;
  readonly order: readonly number[];
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
  /** Hosts scheduled for a new shape selection. */
  shapeDirtyPaths: Set<string>;
  /** Paths whose own source channels changed. */
  changedRaw: Set<string>;
  /** Explicit caller changes retained for Source B. */
  explicitRaw: Set<string>;
  /** Nodes whose source or calculated result changed. */
  changedNodes: Set<Self>;
  /** Effective schemas recorded before this settlement. */
  originalSchemas: Map<string, EffectiveSchema>;
}

/** Minimal per-tree slots consumed by the first settlement engine. */
export interface SchemaNodeRuntime<Self> extends SchemaNodeRootRuntimeState {
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
  /** Synchronous predicates for authored if gates. */
  ifPredicates: ReadonlyMap<BlueprintGate, (gateInput: unknown) => boolean>;
  /** Settlement health retained until a form-level load. */
  diagnostics: SchemaNodeDiagnostics;
  /** Single node creator used throughout this tree. */
  nodeFactory: SchemaNodeFactory<Self>;
  /** Lazily retained work containers for non-reentrant settlement calls. */
  settlementScratch?: SettlementScratch<Self>;
}
