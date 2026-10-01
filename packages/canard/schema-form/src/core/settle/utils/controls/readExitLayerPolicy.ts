import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { ControlLayer } from './getControlLayers';
import { getExitPolicyKey } from './getExitPolicyKey';

/** Exit policy specificity; each layer resolves keep before clear. */
const EXIT_LAYERS = ['node', 'children', 'fragment'] as const;

/**
 * Resolve committed exit values for the nearest authored control layer.
 * @param groups - Previously active controls addressing one occurrence
 * @param committedRuleValues - Expression results from the last live commit
 * @param inherited - Policy from a departing ancestor or the Form property
 * @returns The first declared layer's unanimous clear or any keep decision
 */
export const readExitLayerPolicy = (
  groups: readonly ControlLayer<{ path: string; blueprintNode: { kind: string } }>[],
  committedRuleValues: ReadonlyMap<string, unknown> | undefined,
  inherited: boolean,
): boolean => {
  for (const layer of EXIT_LAYERS) {
    let declared = false;
    let keep = false;
    for (const group of groups) {
      if (group.layer !== layer ||
        !hasOwnProperty(group.controls, 'unsetOnInactive')) continue;
      declared = true;
      const literal: unknown = Reflect.get(group.controls, 'unsetOnInactive');
      const key = getExitPolicyKey(group);
      const value = typeof literal === 'string' ? committedRuleValues?.get(key) : literal;
      if (value !== true) keep = true;
    }
    if (declared) return !keep;
  }
  return inherited;
};
