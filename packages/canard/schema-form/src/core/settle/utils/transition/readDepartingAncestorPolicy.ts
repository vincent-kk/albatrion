import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { getControlLayers } from '../controls/getControlLayers';
import { readExitLayerPolicy } from '../controls/readExitLayerPolicy';
import { hasOwnProperty } from '@winglet/common-utils/lib';

/**
 * Find the nearest departed declaration on a still-live ancestor.
 * @param context - Previous committed and current selected declaration sets
 * @param node - Top occurrence being detached from its parent
 * @returns A departing declaration's choice or the Form fallback
 */
export const readDepartingAncestorPolicy = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>, node: Self,
): boolean => {
  for (let ancestor = node.parent; ancestor; ancestor = ancestor.parent) {
    if (ancestor.detached) continue;
    const previous = getControlLayers(ancestor, new Map());
    const departed = previous.filter((group) => {
      if (!hasOwnProperty(group.controls, 'unsetOnInactive')) return false;
      const key = JSON.stringify([group.host.path, group.host.blueprintNode.kind]);
      const selected = context.selectedDeclarationIds.get(group.host) ??
        context.root.runtime.committedDeclarationIds?.get(key);
      return !selected?.includes(group.declarationId);
    });
    if (departed.length)
      return readExitLayerPolicy(departed,
        context.root.runtime.committedRuleValues,
        context.root.runtime.unsetOnInactive === true);
  }
  return context.root.runtime.unsetOnInactive === true;
};
