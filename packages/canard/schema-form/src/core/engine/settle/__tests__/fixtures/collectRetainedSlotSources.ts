import { escapeSegment } from '@winglet/json/pointer';

import type { BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import { getBlueprintNodeIdentity } from '../../../utils/nodeIdentity/getBlueprintNodeIdentity';
import { getSlotEntries } from '../../utils/slots/getSlotEntries';
import { getSlotSource } from '../../utils/slots/getSlotSource';
import { readSlotRawTree } from '../../utils/slots/readSlotRawTree';

/**
 * Capture visited retained candidates without exposing a storage-map facade.
 * @param root - Live root whose source graph is finite at the materialized value depth
 * @returns Document-ordered addresses, kinds and interpreted retained raw trees
 */
export const collectRetainedSlotSources = <Self extends FieldNodeRecord<Self>>(
  root: Self,
): { path: string; kind: string; raw: unknown }[] => {
  const result: { path: string; kind: string; raw: unknown }[] = [];
  const visit = (
    source: Self | undefined,
    overlay: InactiveSlotOverlay | undefined,
    template: BlueprintNode,
    path: string,
    retained: boolean,
  ): void => {
    for (const entry of getSlotEntries(source, overlay, template)) {
      const child = getSlotSource(source, entry, overlay);
      const address = path + '/' + escapeSegment(entry.name);
      const inactive = retained || !!child.source?.detached || !!child.overlay;
      if (inactive)
        result.push({
          path: address,
          kind: getBlueprintNodeIdentity(entry.node),
          raw: readSlotRawTree(entry.node, child.source, child.overlay),
        });
      visit(child.source, child.overlay, entry.node, address, inactive);
    }
  };
  visit(root, undefined, root.blueprintNode, '', false);
  return result;
};
