import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { FieldNodeRecord } from '../../../record';
import { emptyReadonlyMap } from '../../../utils/emptyReadonlyMap';
import { getControlLayers } from '../controls/getControlLayers';
import { readExitLayerPolicy } from '../controls/readExitLayerPolicy';

/**
 * Retain an occurrence's last-live explicit policy independently of root rule pruning.
 * @param node - Departing occurrence or an already retained inactive candidate
 * @param inherited - Current departing ancestor's keep/clear decision
 * @returns The explicit last-live decision, otherwise the supplied inheritance
 */
export const readSlotExitPolicy = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  inherited: boolean,
): boolean => {
  if (!hasOwnProperty(node, 'retainedExitPolicy')) {
    const layers = getControlLayers(node, emptyReadonlyMap, true);
    const keep = readExitLayerPolicy(
      layers,
      node.runtime.committedRuleValues,
      false,
    );
    const clear = readExitLayerPolicy(
      layers,
      node.runtime.committedRuleValues,
      true,
    );
    node.retainedExitPolicy = keep === clear ? keep : undefined;
  }
  return node.retainedExitPolicy ?? inherited;
};
