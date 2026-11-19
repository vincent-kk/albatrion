import type { Ajv, Options } from 'ajv';

/** Exact native entries observed while resolving an application address. */
export interface ApplicationEntry {
  /** Exact native schema entry or detached resource value selected in this record. */
  readonly schema: unknown;
  /** Exact native alias or compiled-reference entry observed for the key. */
  readonly ref: unknown;
}
/** A raw application document and the location selected by its address. */
export interface ApplicationResource {
  /** Raw owning application document; copied before private registration. */
  readonly document: object | boolean;
  /** Schema value selected inside the owning document. */
  readonly target: object | boolean;
  /** Native registration address used to resolve this document. */
  readonly key: string;
  /** Whether the application registered the document as a meta-schema. */
  readonly meta: boolean;
  /** Visited occupied and absent entries used to detect application changes. */
  readonly observations: ReadonlyMap<string, ApplicationEntry>;
}
/** One private native environment, retired atomically when its observations change. */
export interface PrivateCompiler {
  /** Plugin-owned native compiler with independent code and schema registries. */
  readonly instance: Ajv;
  /** Read-only application instance supplying the live profile. */
  readonly source: Ajv;
  /** Namespace separating full validation, guards and meta validation. */
  readonly kind: 'validation' | 'guard' | 'meta';
  /** Option key/value identities recorded when this environment is constructed. */
  readonly options: readonly (readonly [string, unknown])[];
  /** Application option count used to detect additions and removals. */
  readonly optionCount: number;
  /** Only imported aliases, meta addresses and root collision keys observed by this compiler. */
  readonly entries: Map<string, ApplicationEntry>;
  /** Used keyword names and their application definition identities. */
  readonly rules: Map<string, unknown>;
  /** Used format names and their application definition identities. */
  readonly formats: Map<string, unknown>;
  /** Application registration keys already copied into this compiler. */
  readonly imported: Set<string>;
  /** Normalized native resource ids and the raw documents that claim them. */
  readonly claims: Map<
    string,
    { document: object | boolean; key: string; schema: object }
  >;
  /** Detached schema copies indexed by their raw application document. */
  readonly copies: Map<object | boolean, object | boolean>;
  /** Form resource reservations retained until this compiler is retired, including released attempts. */
  formOwners?: Map<string, string>;
  /** Last resource-free root facts, containing no caller or detached schema objects. */
  factsCache?: {
    readonly serialized: string;
    readonly facts: SchemaDependencies;
  };
  /** Whether the requested schema graph needs asynchronous native compilation. */
  asynchronous: boolean;
  /** Prevents a stale or failed environment from compiling new roots. */
  retired: boolean;
  /** Registration attempts charged to this bounded environment. */
  count: number;
  /** Native issue collection policy selected for this namespace. */
  readonly allErrors: boolean;
  /** Native schema-validation policy restored after empty bootstrap construction. */
  readonly validateSchema: Options['validateSchema'];
}
/** A schema position claiming an address; all schema objects are detached. */
export interface SchemaResource {
  /** Normalized native resource address, including an anchor when present. */
  readonly address: string;
  /** Exact native schema entry or detached resource value selected in this record. */
  readonly schema: object;
  /** Whether the resource declaration belongs to the authored document root. */
  readonly root: boolean;
}
/** Readable facts needed before native compilation, independent of AJV inlining. */
export interface SchemaDependencies {
  /** Resource claims or requested raw resources collected for the current root. */
  readonly resources: SchemaResource[];
  /** Authored references together with their resolution bases and normalized addresses. */
  readonly references: {
    readonly base: string;
    readonly ref: string;
    readonly address: string;
  }[];
  /** Used keyword names and their application definition identities. */
  readonly rules: Map<string, unknown>;
  /** Used format names and their application definition identities. */
  readonly formats: Map<string, unknown>;
  /** Whether the requested schema graph needs asynchronous native compilation. */
  asynchronous: boolean;
}

/** Requested raw imports and resource identities for one compilation. */
export interface ApplicationGraph {
  /** Resource claims or requested raw resources collected for the current root. */
  readonly resources: Map<string, ApplicationResource>;
  /** Facts collected once for every raw document needed by this root. */
  readonly documents: Map<object | boolean, SchemaDependencies>;
  /** Used format names and their application definition identities. */
  readonly formats: Map<string, unknown>;
  /** Normalized native resource ids and the raw documents that claim them. */
  readonly claims: Map<
    string,
    { document: object | boolean; key: string; schema: object }
  >;
  /** Visited occupied and absent entries used to detect application changes. */
  readonly observations: Map<string, ApplicationEntry>;
  /** Whether the requested schema graph needs asynchronous native compilation. */
  asynchronous: boolean;
}
