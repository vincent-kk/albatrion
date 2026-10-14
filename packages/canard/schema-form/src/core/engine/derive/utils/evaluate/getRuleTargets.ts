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
 * @returns Current target, or none when its scoped declaration is inactive
 */
export const getRuleTargets = <Self extends FieldNodeRecord<Self>>(
  source: Self,
  rule: DeriveRule,
  state: DeriveState<Self>,
): readonly Self[] => {
  if (!rule.targetName) return [source];
  const children = source.structure;
  if (!children || !hasOwnProperty(children, rule.targetName))
    return NO_TARGETS;
  const target = children[rule.targetName];
  if (target.detached) return NO_TARGETS;
  if (
    rule.layer === 'fragment' &&
    rule.targetDeclarationIds &&
    !rule.targetDeclarationIds.some((id) =>
      getSelectedDeclarationIds(target, state).includes(id),
    )
  )
    return NO_TARGETS;
  return [target];
};
