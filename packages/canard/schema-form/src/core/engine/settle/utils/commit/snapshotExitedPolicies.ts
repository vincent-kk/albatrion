import { hasOwnProperty } from '@winglet/common-utils/lib';

import { CONTROL_KEY } from '../../../constants/controlKey';
import { visitFieldNodes } from '../../../navigation';
import type { FieldNodeRecord } from '../../../record';
import { emptyReadonlyMap } from '../../../utils/emptyReadonlyMap';
import type { SettlementContext } from '../../types/settlement';
import { getControlLayers } from '../controls/getControlLayers';
import { readExitLayerPolicy } from '../controls/readExitLayerPolicy';

/**
 * Transfer an exiting occurrence's last-live decisions to its latent source.
 * @param context - Exits and rule values from the prior completed commit
 * @returns Nothing; latent metadata keeps decisions after rule values are pruned
 */
export const snapshotExitedPolicies = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  const runtime = context.root.runtime;
  for (const exited of context.exited)
    visitFieldNodes(
      exited,
      (node) => {
        const key = JSON.stringify([node.path, node.blueprintNode.kind]);
        if (!runtime.latentRaw.has(key)) return;
        const metadata = runtime.latentRawMetadata?.get(key);
        if (!metadata) return;
        const exitLayers = getControlLayers(node, emptyReadonlyMap)
          .filter((group) =>
            hasOwnProperty(group.controls, CONTROL_KEY.unsetOnInactive),
          )
          .map((group) => ({
            layer: group.layer,
            clear: readExitLayerPolicy(
              [group],
              runtime.committedRuleValues,
              false,
            ),
          }));
        runtime.latentRawMetadata?.set(key, { ...metadata, exitLayers });
        context.latentDescendantKeys = undefined;
      },
      { owned: true },
    );
};
