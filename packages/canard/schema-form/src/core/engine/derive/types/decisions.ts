import type { BlueprintChildEntry, BlueprintNode } from '../../blueprint';
import type { SettlementFailureCause } from '../../record';
import type { DeriveRuleKind } from './rules';

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
  readonly result:
    | 'applied'
    | 'lost'
    | 'undefined'
    | 'suppressed'
    | 'withdrawn';
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
  /** Authored failures in evaluation order. */
  readonly failures: readonly {
    readonly sourcePath: string;
    readonly schemaPath: string;
    readonly cause: unknown;
    readonly kind: Exclude<SettlementFailureCause, 'budget' | 'sharedConflict'>;
    readonly targetPath?: string;
    readonly expectedLength?: number;
  }[];
}

/** Final interaction reset decision made before the commit publishes revisions. */
export interface DeriveResetInteractionDecision<Self> {
  /** Live records whose edited and touched flags clear. */
  readonly nodes: readonly Self[];
  /** Development-only decisions, absent in production. */
  readonly trace: readonly DeriveTraceEntry[];
  /** Authored failures in evaluation order. */
  readonly failures: readonly {
    readonly sourcePath: string;
    readonly schemaPath: string;
    readonly cause: unknown;
  }[];
}
