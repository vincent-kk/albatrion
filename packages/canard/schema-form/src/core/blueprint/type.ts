/** Authored schema data; extension values remain opaque until their owner reads them. */
export type BlueprintSchema = Readonly<Record<string, unknown>> | boolean;

/** JSON Schema's seven permitted explicit type names. */
export type SchemaTypeName =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'null'
  | 'object'
  | 'array';

/** Stable runtime kind selected by analysis, including virtual and union nodes. */
export type BlueprintNodeKind =
  | Exclude<SchemaTypeName, 'integer'>
  | 'union'
  | 'virtual';

/** Scalar for ordinary nodes; a shared frozen non-null list for union nodes. */
export type BlueprintSchemaType =
  | SchemaTypeName
  | 'virtual'
  | readonly SchemaTypeName[];

/** Declarative gate; analysis stores conditions but never evaluates them. */
export interface BlueprintGate {
  /** Mechanism that the settlement engine must interpret. */
  readonly kind: 'if' | 'active' | 'discriminator';
  /** Authored location of the condition. */
  readonly schemaPath: string;
  /** Data host from which relative expressions are evaluated. */
  readonly hostPath: string;
  /** Original schema, expression, or discriminator descriptor. */
  readonly condition: unknown;
  /** Select the complementary if branch without executing it. */
  readonly negated?: boolean;
  /** A children rule applies only while its owning declaration is active. */
  readonly appliesWhen?: readonly BlueprintGate[];
}

/** One authored contribution to a property's existence or effective schema. */
export interface PropertyDeclaration {
  /** Root-local identity used for active declaration selection. */
  readonly id: number;
  /** Direct child name, or the empty string for the root. */
  readonly name: string;
  /** Data path of this contribution's host property. */
  readonly path: string;
  /** Authored schema location retained in diagnostics. */
  readonly schemaPath: string;
  /** Original immutable-by-contract authored object. */
  readonly schema: BlueprintSchema;
  /** Owning fragment identity; every declaration belongs to an explicit fragment. */
  readonly fragmentId: number;
  /** Separate shape declarations from constraint-only overlays. */
  readonly role: 'declaration' | 'overlay';
  /** Fragment controls govern declared direct children, never the host input. */
  readonly scope: 'node' | 'fragment';
  /** Primitive/union disjunctive constraints remain validator-only schema data. */
  readonly validationOnly: boolean;
  /** Disjunctive declarations do not constrain shared nodes. */
  readonly context: 'conjunction' | 'declaration';
  /** All conditions that must hold for this contribution. Empty means always active. */
  readonly gates: readonly BlueprintGate[];
  /** Lexicographic keyword-rank/index path, independent of object key order. */
  readonly order: readonly number[];
  /** True for overlays inherited from a referring host. */
  readonly inherited: boolean;
  /** Referring host owning inherited overlays, including reused reference templates. */
  readonly hostPath: string;
}

/** A finite authored fragment with its declaration and overlay ownership. */
export interface SchemaFragment {
  /** Root-local fragment identity. */
  readonly id: number;
  /** Referring data host retaining inherited-overlay ownership. */
  readonly hostPath: string;
  /** Original schema location. */
  readonly schemaPath: string;
  /** Authored fragment object. */
  readonly schema: BlueprintSchema;
  /** Conjunctive overlay or declaration-only branch. */
  readonly context: PropertyDeclaration['context'];
  /** Total-order keyword rank and position path. */
  readonly order: readonly number[];
  /** Conditions inherited from outer fragments and local active controls. */
  readonly gates: readonly BlueprintGate[];
  /** Property declaration IDs created directly by this fragment. */
  readonly declares: readonly number[];
  /** Constraint-only declaration IDs contributed by this fragment. */
  readonly overlays: readonly number[];
  /** Inherited overlay IDs whose owner remains hostPath. */
  readonly inheritedOverlays: readonly number[];
  /** Nested fragment IDs; references never recursively copy the target graph. */
  readonly children: readonly number[];
}

/** A schema-location template, shared rather than expanded through recursive references. */
export interface BlueprintNode {
  /** Root-local template identity. */
  readonly id: number;
  /** Data path of the first occurrence; array templates use an asterisk segment. */
  readonly path: string;
  /** Authored location used to share reference templates. */
  readonly schemaPath: string;
  /** Stable dispatch kind independent of gate state. */
  readonly kind: BlueprintNodeKind;
  /** Static accepted type restriction, with null represented by nullable. */
  readonly schemaType: BlueprintSchemaType;
  /** Whether the static accepted set contains null. */
  readonly nullable: boolean;
  /** Fixed branch or terminal strategy. */
  readonly strategy: 'branch' | 'terminal';
  /** All authored contributions in total order. */
  readonly declarations: readonly PropertyDeclaration[];
  /** Canonical named edges; host bindings stay separate from reusable templates. */
  readonly childEntries: readonly BlueprintChildEntry[];
  /** Homogeneous array template, expanded only by the future node engine. */
  readonly item?: BlueprintNode;
  /** Tuple item templates in positional order. */
  readonly prefixItems?: readonly BlueprintNode[];
  /** Ordered real-field names backing a virtual node. */
  readonly fields?: readonly string[];
}

/** One data-host binding of a child template, including recursive references. */
export interface BlueprintChildEntry {
  /** Direct property name, preserved even when several edges share one template. */
  readonly name: string;
  /** Reusable schema-location template; its path is an origin, not this edge's address. */
  readonly node: BlueprintNode;
  /** Referring host's authored contributions and gates; never added to another host's node. */
  readonly declarations: readonly PropertyDeclaration[];
  /** Referring data host; relative template paths are rebound at this edge. */
  readonly hostPath: string;
}

/** Renderer-independent diagnostic data suitable for an optional collector. */
export interface BlueprintDiagnostic {
  /** Stable domain code without presentation formatting. */
  readonly code: string;
  /** Whether the record prevents construction or advises a consumer. */
  readonly level: 'error' | 'warning';
  /** Authored offending location. */
  readonly schemaPath: string;
  /** Code-specific discriminating values. */
  readonly details: Readonly<Record<string, unknown>>;
}

/** Immutable result of analyzing one authored root. */
export interface Blueprint {
  /** Original root reference, never cloned or mutated by analysis. */
  readonly schema: BlueprintSchema;
  /** Root template. */
  readonly root: BlueprintNode;
  /** Finite templates indexed by id. */
  readonly nodes: readonly BlueprintNode[];
  /** Finite fragment table indexed by id. */
  readonly fragments: readonly SchemaFragment[];
  /** Static watch/expression paths mapped to declaration IDs. */
  readonly dependencies: Readonly<Record<string, readonly number[]>>;
  /** Compiled authored expressions with relative dependencies for per-edge rebinding. */
  readonly expressions: readonly BlueprintExpression[];
}

/** A compiled expression never executed during schema analysis. */
export interface BlueprintExpression {
  /** Contribution whose controls contain this expression. */
  readonly declarationId: number;
  /** Original expression position used in compilation diagnostics. */
  readonly schemaPath: string;
  /** Template-relative host origin, rebound through the occurrence's child edge. */
  readonly hostPath: string;
  /** Control key whose result the future settlement engine consumes. */
  readonly key: string;
  /** Relative or absolute authored paths, without a first-host rewrite. */
  readonly dependencies: readonly string[];
  /** Pure compiled callable; execution belongs to settlement, never blueprint. */
  readonly evaluate: (dependencies: any[]) => any;
}

/** Caller-owned cached result keyed by schema and renderer predicate identity. */
export interface BlueprintCacheEntry {
  /** Terminal predicate identity used to construct the result. */
  readonly isTerminal: BlueprintOptions['isTerminal'];
  /** Atomic predicate identity used for effective-schema consistency. */
  readonly isAtomic: BlueprintOptions['isAtomic'];
  /** Completed immutable analysis. */
  readonly blueprint: Blueprint;
  /** Late warnings are delivered at most once per authored root/cache entry. */
  warningsCollected: boolean;
}

/** Explicit dependencies and diagnostics; no process-global cache is used. */
export interface BlueprintOptions {
  /** Return a renderer's terminal decision; undefined leaves earlier hints intact. */
  readonly isTerminal?: (schema: BlueprintSchema) => boolean | undefined;
  /** Identify opaque renderer values without importing renderer implementation code. */
  readonly isAtomic?: (value: unknown) => boolean;
  /** Receive diagnostic data; absence avoids warning scans entirely. */
  readonly collect?: (diagnostic: BlueprintDiagnostic) => void;
  /** Cache owned by the caller; object roots only. */
  readonly cache?: WeakMap<object, BlueprintCacheEntry[]>;
}

/** Effective-schema merge policies, independent of blueprint construction caching. */
export interface EffectiveSchemaOptions {
  /** Static conjunction failures throw; runtime conflicts remain schema data. */
  readonly mode?: 'static' | 'runtime';
  /** Renderer-supplied opaque-value predicate used by group object merging. */
  readonly isAtomic?: BlueprintOptions['isAtomic'];
  /** Optional collector for path-aware static errors. */
  readonly collect?: BlueprintOptions['collect'];
}

/** Caller-owned effective-schema memo, separated by node and normalized active set. */
export type EffectiveSchemaMemo = WeakMap<
  BlueprintNode,
  EffectiveSchemaCacheEntry[]
>;

/** Immutable merge result: renderer hints plus the signal settlement reads. */
export interface EffectiveSchema {
  /** Frozen hints for this active set; false when a contributing schema forbids every value. */
  readonly schema: BlueprintSchema;
  /** True when the active gated types share nothing with the static accepted set. */
  readonly typeConflict: boolean;
}

/** Separate memo contexts prevent runtime conflicts from bypassing static validation. */
export interface EffectiveSchemaCacheEntry {
  /** Error behavior belonging to this memo context. */
  readonly mode: 'static' | 'runtime';
  /** Renderer atomicity predicate identity belonging to this context. */
  readonly isAtomic: BlueprintOptions['isAtomic'];
  /** Normalized active declaration sets mapped to immutable result records. */
  readonly schemas: Map<string, EffectiveSchema>;
}
