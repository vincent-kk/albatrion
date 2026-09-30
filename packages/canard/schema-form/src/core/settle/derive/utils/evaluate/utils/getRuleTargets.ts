import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { SchemaNodeRecord } from '../../../../../record';
import type { DeriveRule, DeriveState } from '../../../type';
import { getSelectedDeclarationIds } from './getSelectedDeclarationIds';

/**
 * Resolve a node, parent children item, or fragment scope in the live shape.
 * @param source - Live declaration host that owns the authored control
 * @param rule - Template and direct-child selection for the control
 * @param state - Active declaration IDs for the current complete tree
 * @returns Current target, or none when its scoped declaration is inactive
 */
export const getRuleTargets = <Self extends SchemaNodeRecord<Self>>(
  source: Self, rule: DeriveRule, state: DeriveState<Self>,
): readonly Self[] => {
  if (!rule.targetName) return [source];
  const children = source.structure;
  if (!children || !hasOwnProperty(children, rule.targetName)) return [];
  const target = children[rule.targetName];
  if (target.detached) return [];
  if (rule.layer === 'fragment' && rule.targetDeclarationIds &&
    !rule.targetDeclarationIds.some((id) =>
      getSelectedDeclarationIds(target, state).includes(id))) return [];
  return [target];
};
