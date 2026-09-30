import type { SchemaNodeRecord } from '../../../record';
import { getDeriveRuleTable } from '../../derive';
import type { DeriveState } from '../../derive';
import type { SettlementContext } from '../../type';

/**
 * Allocate call-local edge baselines only for analyses with authored rules.
 * @param context - Current settlement and its previous committed runtime
 * @returns Reused call state, or undefined for a rule-free blueprint
 */
export const getDeriveState = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>,
): DeriveState<Self> | undefined => {
  if (context.deriveState) return context.deriveState;
  if (getDeriveRuleTable(context.root.runtime.blueprint).rules.length === 0)
    return undefined;
  const state: DeriveState<Self> = {
    root: context.root,
    selectedDeclarationIds: context.selectedDeclarationIds,
    committedRuleValues: context.root.runtime.committedRuleValues ?? new Map(),
    consumedRuleValues: new Map(),
    activeRuleKeys: new Set(),
    activeUnsetTargets: new Set(),
    visitedSourcePaths: new Set(),
    loadScope: context.loadScope,
    suppressAutomaticWrites: context.suppressAutomaticWrites,
    trace: process.env.NODE_ENV !== 'production',
  };
  context.deriveState = state;
  return state;
};
