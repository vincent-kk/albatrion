import type { BlueprintExpression } from '../../blueprint';
import type { DeclarationLayer } from '../../types/controls';

/** Authored automatic rule kinds, including the later injection rule. */
export type DeriveRuleKind =
  | 'derived'
  | 'unsetValue'
  | 'resetInteraction'
  | 'injectTo';

/** One static authored rule rebound to a live record during settlement. */
export interface DeriveRule {
  /** Declaration whose active selection admits this rule. */
  readonly declarationId: number;
  /** Rule kind and priority category. */
  readonly kind: DeriveRuleKind;
  /** Original expression position, unique within the analysis. */
  readonly schemaPath: string;
  /** Declaration layer that chooses the addressed value target. */
  readonly layer: DeclarationLayer;
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
