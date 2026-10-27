import type { FieldNodeRecord } from '../../../record';
import { emptyReadonlyMap } from '../../../utils/emptyReadonlyMap';
import { getBlueprintNodeIdentity } from '../../../utils/nodeIdentity/getBlueprintNodeIdentity';
import type { SettlementContext } from '../../types/settlement';
import { getControlLayers } from '../controls/getControlLayers';
import { readExitLayerPolicy } from '../controls/readExitLayerPolicy';

/**
 * Find the nearest departed declaration on a still-live ancestor.
 * @param context - Previous committed and current selected declaration sets
 * @param node - Top occurrence being detached from its parent
 * @returns A departing declaration's choice or the Form fallback
 */
export const readDepartingAncestorPolicy = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  node: Self,
): boolean => {
  for (let ancestor = node.parent; ancestor; ancestor = ancestor.parent) {
    if (ancestor.detached) continue;
    const previous = getControlLayers(ancestor, emptyReadonlyMap, true);
    const departed = previous.filter((group) => {
      const key = JSON.stringify([
        group.host.path,
        getBlueprintNodeIdentity(group.host.blueprintNode),
      ]);
      const selected =
        context.selectedDeclarationIds.get(group.host) ??
        context.root.runtime.committedDeclarationIds?.get(key);
      return !selected?.includes(group.declarationId);
    });
    if (departed.length)
      return readExitLayerPolicy(
        departed,
        context.root.runtime.committedRuleValues,
        context.root.runtime.unsetOnInactive === true,
      );
  }
  return context.root.runtime.unsetOnInactive === true;
};
