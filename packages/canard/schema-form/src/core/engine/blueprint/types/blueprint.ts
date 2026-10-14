import type {
  FormErrorLevel,
  FormWarningCode,
  JSONSchemaErrorCode,
} from '@/schema-form/errors';

import type { ChildControlKey } from '../../types/controls';
import type { BlueprintNode, SchemaFragment } from './node';
import type { BlueprintSchema } from './schema';

/** Renderer-independent diagnostic data suitable for an optional collector. */
export interface BlueprintDiagnostic {
  /** Group-qualified error or warning code. */
  readonly code: JSONSchemaErrorCode | FormWarningCode;
  /** Whether the record prevents construction or advises a consumer. */
  readonly level: FormErrorLevel;
  /** Authored offending location. */
  readonly schemaPath: string;
  /** Code-specific discriminating values. */
  readonly details: Readonly<Record<string, unknown>>;
}

/** Immutable result of analyzing one authored root. */
export interface Blueprint {
  /** Independent absence proofs over every authored position declaration collection reaches. */
  readonly capabilities: {
    /** No disjunction, if, discriminator or active control was reached. */
    readonly branchless: boolean;
    /** At least one supported control was authored as an expression string. */
    readonly hasExpressions: boolean;
    /** Automatic value/interaction rules exist independently of gates. */
    readonly hasDerive: boolean;
    /** A watch declaration exists, including an empty authored list. */
    readonly hasWatch: boolean;
    /** Local or child-scoped state keys can contribute to the feature index. */
    readonly hasState: boolean;
    /** Compiled expressions or watch paths registered reverse dependencies. */
    readonly hasDependencies: boolean;
  };
  /** Renderer predicates retained by identity for runtime schema merging. */
  readonly isAtomic?: BlueprintOptions['isAtomic'];
  /** Terminal strategy predicate used when constructing this analysis. */
  readonly isTerminal?: BlueprintOptions['isTerminal'];
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

/** Conservative static bounds shared by feature passes for one blueprint. */
export interface BlueprintFeatureNodeIndex {
  /** Templates whose own declarations can change local state keys. */
  readonly stateKeyNodes: ReadonlySet<number>;
  /** Parent templates and direct child names addressed by state control layers. */
  readonly stateKeyChildren: ReadonlyMap<number, ReadonlySet<string>>;
  /** Templates whose node or referring-edge declarations can supply watch hints. */
  readonly watchNodes: ReadonlySet<number>;
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
  readonly key: ChildControlKey;
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
