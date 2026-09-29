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
  /** Original input owned by this node. */
  raw: unknown;
  /** Undeclared input retained beside the declared child values. */
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
  assemble(node: SchemaNodeRecord<Self>, children: readonly Self[]): unknown;
  /** Project a local value into the outgoing value. */
  project(node: SchemaNodeRecord<Self>, local: unknown): unknown;
  /** Return a completed input string, or undefined when there is no write. */
  finishInput(node: SchemaNodeRecord<Self>): string | undefined;
  /** Describe children to be created by the caller. */
  declareChildren(node: SchemaNodeRecord<Self>): readonly BlueprintChildEntry[];
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

/** Root-owned settlement data reached through a record's runtime. */
interface SchemaNodeRootRuntimeState {
  /** Form-level load source, read at node paths. */
  loadSnapshot: unknown;
  /** Source values kept for nodes outside the live shape. */
  latentRaw: Map<string, unknown>;
  /** Current paths whose raw values miss their effective types. */
  typeMismatchPaths: Set<string>;
  /** Commit-scoped inactive value lists keyed by node path. */
  inactiveValuesMemo: Map<string, readonly { path: string; value: unknown }[]>;
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

/** Minimal per-tree slots consumed by the first settlement engine. */
export interface SchemaNodeRuntime<Self> extends SchemaNodeRootRuntimeState {
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
  /** Synchronous predicates for authored if gates. */
  ifPredicates: ReadonlyMap<BlueprintGate, (gateInput: unknown) => boolean>;
  /** Settlement health retained until a form-level load. */
  diagnostics: SchemaNodeDiagnostics;
  /** Host and transition iteration limits. */
  budgets: { hostWheel: number; transition: number };
  /** Single node creator used throughout this tree. */
  nodeFactory: SchemaNodeFactory<Self>;
}
