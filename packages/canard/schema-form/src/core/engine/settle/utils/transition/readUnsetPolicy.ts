import type { FieldNodeRecord } from '../../../record';
import { emptyReadonlyMap } from '../../../utils/emptyReadonlyMap';
import { getControlLayers } from '../controls/getControlLayers';
import { readExitLayerPolicy } from '../controls/readExitLayerPolicy';

/**
 * Resolve the last live declaration layers before an inherited exit policy.
 * @param node - Departing occurrence with its last committed declaration IDs
 * @param inherited - Nearest departing ancestor or Form policy
 * @returns The closest authored keep or clear decision
 */
export const readUnsetPolicy = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  inherited: boolean,
): boolean =>
  readExitLayerPolicy(
    getControlLayers(node, emptyReadonlyMap),
    node.runtime.committedRuleValues,
    inherited,
  );
