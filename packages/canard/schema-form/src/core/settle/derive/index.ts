export { getDeriveRuleTable } from './utils/rules/getDeriveRuleTable';
export { evaluateDeriveRound } from './utils/evaluate/evaluateDeriveRound';
export { evaluateResetInteraction } from './utils/evaluate/evaluateResetInteraction';
export type { DeriveRuleTable, DeriveState, DeriveRoundDecision,
  DeriveResetInteractionDecision, DeriveTraceEntry } from './type';
/** Maximum number of applied automatic-write rounds in one settlement. */
export const DERIVE_ROUND_CAP = 25;
