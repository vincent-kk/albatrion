import { hasOwnProperty } from '@winglet/common-utils/lib';

import { walkOwnedSchemaNodes } from '../walkOwnedSchemaNodes';
import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { getControlLayers } from '../controls/getControlLayers';
import { readExitLayerPolicy } from '../controls/readExitLayerPolicy';

/**
 * Transfer an exiting occurrence's last-live decisions to its latent source.
 * @param context - Exits and rule values from the prior completed commit
 * @returns Nothing; latent metadata keeps decisions after rule values are pruned
 */
export const snapshotExitedPolicies = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  const runtime = context.root.runtime;
  for (const exited of context.exited)
    walkOwnedSchemaNodes(exited, (node) => {
      const key = JSON.stringify([node.path, node.blueprintNode.kind]);
      if (!runtime.latentRaw.has(key)) return;
      const metadata = runtime.latentRawMetadata?.get(key);
      if (!metadata) return;
      const exitLayers = getControlLayers(node, new Map()).filter((group) =>
        hasOwnProperty(group.controls, 'unsetOnInactive')).map((group) => ({
        layer: group.layer,
        clear: readExitLayerPolicy([group], runtime.committedRuleValues, false),
      }));
      runtime.latentRawMetadata?.set(key, { ...metadata, exitLayers });
    });
};
