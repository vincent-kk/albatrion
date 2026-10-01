import type { BlueprintChildEntry, BlueprintExpression, BlueprintNode } from '../../blueprint';
import type { SchemaNodeRecord } from '../../record';

/** Authored automatic rule kinds, including the later injection rule. */
export type DeriveRuleKind = 'derived' | 'unsetValue' | 'resetInteraction' | 'injectTo';

/** One static authored rule rebound to a live record during settlement. */
export interface DeriveRule {
  /** Declaration whose active selection admits this rule. */
  readonly declarationId: number;
  /** Rule kind and priority category. */
  readonly kind: DeriveRuleKind;
  /** Original expression position, unique within the analysis. */
  readonly schemaPath: string;
  /** Declaration layer that chooses the addressed value target. */
  readonly layer: 'fragment' | 'children' | 'node';
  /** Direct child name for a scoped rule; absent for a node's own control. */
  readonly targetName?: string;
  /** Direct child declarations contributed by this fragment. */
  readonly targetDeclarationIds?: readonly number[];
  /** Read paths that trigger this rule, with watch paths only for derived. */
  readonly dependencies: readonly string[];
  /** Watches resolved against the value target rather than a parent host. */
  readonly watchDependencies: readonly string[];
  /** Compiled expression when the control was authored as a string. */
  readonly expression?: BlueprintExpression;
  /** Literal control value when no compiled expression is needed. */
  readonly literal: unknown;
  /** Authored order among rule templates for tied declarations. */
  readonly order: number;
}

/** Reusable rule templates for one immutable blueprint. */
export interface DeriveRuleTable {
  /** Rules in authored template order. */
  readonly rules: readonly DeriveRule[];
  /** Direct access from active declaration ID to its rules. */
  readonly byDeclaration: ReadonlyMap<number, readonly DeriveRule[]>;
}

/** One development-only account of a rule decision. */
export interface DeriveTraceEntry {
  /** Settlement phase that made the decision. */
  readonly phase: 'derive' | 'commit';
  /** Kind of authored control. */
  readonly kind: DeriveRuleKind;
  /** Live source occurrence. */
  readonly sourcePath: string;
  /** Live value target. */
  readonly targetPath: string;
  /** Value before the decision. */
  readonly previousValue: unknown;
  /** Candidate value after evaluation. */
  readonly nextValue: unknown;
  /** Why the candidate did or did not write. */
  readonly result: 'applied' | 'lost' | 'undefined' | 'suppressed' | 'withdrawn';
}

/** Tree and edge baselines supplied by settle without a reverse dependency. */
export interface DeriveState<Self extends SchemaNodeRecord<Self>> {
  /** Active root whose output supplies all dependency reads. */
  readonly root: Self;
  /** Current gate selections for this complete shape. */
  readonly selectedDeclarationIds: ReadonlyMap<Self, readonly number[]>;
  /** Last committed values for rules in the previous shape. */
  readonly committedRuleValues: ReadonlyMap<string, unknown>;
  /** Values already consumed during this synchronous settlement. */
  readonly consumedRuleValues: Map<string, unknown>;
  /** Final live rule keys from this round, used to prune exited occurrences. */
  readonly activeRuleKeys: Set<string>;
  /** Live targets whose true unset rule prevents transition fill. */
  readonly activeUnsetTargets: Set<Self>;
  /** Highest kind rank already applied to each target in this settlement. */
  readonly appliedRanks: Map<string, number>;
  /** Source paths affected by a non-load write; absent for a load scan. */
  sourcePaths?: ReadonlySet<string>;
  /** Sources examined during this settlement, including later rounds. */
  readonly visitedSourcePaths: Set<string>;
  /** Source subtree whose load resets rule baselines. */
  readonly loadScope?: Self;
  /** Nodes newly created or explicitly reloaded during this settlement. */
  readonly entered: ReadonlySet<Self>;
  /** Existing occurrences restored after a temporary exit in this settlement. */
  readonly revived: ReadonlySet<Self>;
  /** Whether this call inhibits automatic writes. */
  readonly suppressAutomaticWrites: boolean;
  /** Whether development trace entries should be allocated. */
  readonly trace: boolean;
}

/** Candidate for one automatic write after an edge has been consumed. */
export interface DeriveWrite<Self> {
  /** Live target record, absent when an injection addresses latent raw. */
  readonly target?: Self;
  /** Absolute data path of the addressed target. */
  readonly targetPath: string;
  /** Static template for a latent target. */
  readonly template?: BlueprintNode;
  /** Sibling templates used when distributing a latent replacement. */
  readonly siblings?: readonly BlueprintChildEntry[];
  /** Document position of a latent target. */
  readonly targetOrder?: readonly number[];
  /** Raw replacement value, including undefined for unset. */
  readonly value: unknown;
  /** Kind of rule that produced this candidate. */
  readonly kind: 'derived' | 'unsetValue' | 'injectTo';
  /** Kind precedence calculated from derive's rank table. */
  readonly rank: number;
  /** Declaration specificity used after kind rank. */
  readonly layer: 1 | 2 | 3;
  /** Live source position in document preorder. */
  readonly sourceOrder: readonly number[];
  /** Authored declaration order within the source and layer. */
  readonly ruleOrder: number;
  /** Return entry order within one injectTo call. */
  readonly returnOrder: number;
}

/** Pure decision for one complete-tree derivation round. */
export interface DeriveRoundDecision<Self> {
  /** At most one winning write for each target in this round. */
  readonly writes: readonly DeriveWrite<Self>[];
  /** Development-only decisions, absent in production. */
  readonly trace: readonly DeriveTraceEntry[];
  /** First authored expression failure, if any. */
  readonly failure?: { readonly sourcePath: string; readonly schemaPath: string;
    readonly cause: unknown; readonly kind: 'expression' | 'injectTarget' | 'writeShape';
    readonly targetPath?: string; readonly expectedLength?: number };
}

/** Final interaction reset decision made before the commit publishes revisions. */
export interface DeriveResetInteractionDecision<Self> {
  /** Live records whose dirty and touched flags clear. */
  readonly nodes: readonly Self[];
  /** Development-only decisions, absent in production. */
  readonly trace: readonly DeriveTraceEntry[];
  /** First authored expression failure, if any. */
  readonly failure?: { readonly sourcePath: string; readonly schemaPath: string;
    readonly cause: unknown };
}
