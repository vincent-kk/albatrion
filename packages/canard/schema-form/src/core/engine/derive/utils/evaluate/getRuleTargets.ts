import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { FieldNodeRecord } from '../../../record';
import type { DeriveRule } from '../../types/rules';
import type { DeriveState } from '../../types/state';
import { getSelectedDeclarationIds } from './getSelectedDeclarationIds';

/** Shared frozen result when a rule resolves to no target. */
const NO_TARGETS: readonly never[] = Object.freeze([]);

/**
 * Resolve a node, parent fields entry, or fragment scope in the live shape.
 * @param source - Live declaration host that owns the authored control
 * @param rule - Template and direct-child selection for the control
 * @param state - Active declaration IDs for the current complete tree
 * @returns Every current matching item or named child whose declaration is selected
 */
export const getRuleTargets = <Self extends FieldNodeRecord<Self>>(
  source: Self,
  rule: DeriveRule,
  state: DeriveState<Self>,
): readonly Self[] => {
  if (rule.targetName === undefined && !rule.targetItems) return [source];
  const children = source.structure;
  // A repeated array template addresses every live item; declaration selection filters below.
  const targets = rule.targetItems
    ? (source.children ?? NO_TARGETS)
    : children &&
        rule.targetName !== undefined &&
        hasOwnProperty(children, rule.targetName)
      ? [children[rule.targetName]]
      : NO_TARGETS;
  return targets.filter(
    (target) =>
      !target.detached &&
      (rule.layer !== 'fragment' ||
        !rule.targetDeclarationIds ||
        rule.targetDeclarationIds.some((id) =>
          getSelectedDeclarationIds(target, state).includes(id),
        )),
  );
};
