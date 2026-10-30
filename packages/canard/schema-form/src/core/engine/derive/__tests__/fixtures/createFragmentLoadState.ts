import type { PlainNode } from '../../../__tests__/fixtures/createPlainNode';
import type { DeriveState } from '../../types/state';

/**
 * Create isolated round state with every mounted target treated as loaded.
 * @param root - Mounted plain-record root with selected declaration baselines
 * @returns Fresh edge ledgers and a root-wide load scope
 */
export const createFragmentLoadState = (
  root: PlainNode,
): DeriveState<PlainNode> => ({
  root,
  selectedDeclarationIds: new Map(),
  committedRuleValues: new Map(),
  consumedRuleValues: new Map(),
  activeRuleKeys: new Set(),
  activeRuleKeysBySource: new Map(),
  activeUnsetTargets: new Set(),
  appliedRanks: new Map(),
  visitedSourcePaths: new Set(),
  loadScope: root,
  entered: new Set(),
  revived: new Set(),
  suppressAutomaticWrites: false,
  trace: false,
});
