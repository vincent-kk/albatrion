import { escapeSegment } from '@winglet/json/pointer';

import type { BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import { getBlueprintNodeIdentity } from '../../../utils/nodeIdentity/getBlueprintNodeIdentity';
import { getSlotEntries } from '../../utils/slots/getSlotEntries';
import { getSlotSource } from '../../utils/slots/getSlotSource';
import { readSlotSourceTree } from '../../utils/slots/readSlotSourceTree';

/**
 * Capture visited retained candidates without exposing a storage-map facade.
 * @param root - Live root whose source graph is finite at the materialized value depth
 * @returns Document-ordered addresses, kinds and interpreted retained source trees
 */
export const collectRetainedSlotSources = <Self extends FieldNodeRecord<Self>>(
  root: Self,
): { path: string; kind: string; source: unknown }[] => {
  const result: { path: string; kind: string; source: unknown }[] = [];
  const visit = (
    instance: Self | undefined,
    overlay: InactiveSlotOverlay | undefined,
    template: BlueprintNode,
    path: string,
    retained: boolean,
  ): void => {
    for (const entry of getSlotEntries(instance, overlay, template)) {
      const child = getSlotSource(instance, entry, overlay);
      const address = path + '/' + escapeSegment(entry.name);
      const inactive =
        retained || !!child.instance?.detached || !!child.overlay;
      if (inactive)
        result.push({
          path: address,
          kind: getBlueprintNodeIdentity(entry.node),
          source: readSlotSourceTree(entry.node, child.instance, child.overlay),
        });
      visit(child.instance, child.overlay, entry.node, address, inactive);
    }
  };
  visit(root, undefined, root.blueprintNode, '', false);
  return result;
};
