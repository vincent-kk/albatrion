import { filter as filterArray } from '@winglet/common-utils/array';
import { EMPTY_ARRAY } from '@winglet/common-utils/constant';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { FieldNodeRecord } from '../../../record';
import type { DeriveRule } from '../../types/rules';
import type { DeriveState } from '../../types/state';
import { getSelectedDeclarationIds } from './getSelectedDeclarationIds';

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
    ? (source.children ?? EMPTY_ARRAY)
    : children &&
        rule.targetName !== undefined &&
        hasOwnProperty(children, rule.targetName)
      ? [children[rule.targetName]]
      : EMPTY_ARRAY;

  return filterArray(targets, (target) => {
    if (target.detached) return false;
    if (rule.layer !== 'fragment' || !rule.targetDeclarationIds) return true;
    for (const id of rule.targetDeclarationIds)
      if (getSelectedDeclarationIds(target, state).indexOf(id) !== -1)
        return true;
    return false;
  });
};
