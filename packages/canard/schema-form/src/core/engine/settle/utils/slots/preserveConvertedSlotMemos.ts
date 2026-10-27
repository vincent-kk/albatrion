import { escapeSegment } from '@winglet/json/pointer';

import type { BlueprintNode } from '../../../blueprint';
import type {
  FieldNodeRecord,
  FieldNodeRuntime,
  InactiveSlotOverlay,
} from '../../../record';
import { getBlueprintNodeIdentity } from '../../../utils/nodeIdentity/getBlueprintNodeIdentity';
import { getSlotEntries } from './getSlotEntries';
import { getSlotSource } from './getSlotSource';

/**
 * Preserve committed entry identities when an input changes its source representation.
 * @param template - Exact kind identifying the earlier converted latent entry
 * @param source - Next retained instance, absent for an input-only source
 * @param overlay - Pending patch whose public memo can inherit the committed entry
 * @param path - Current source address after structural moves
 * @param runtime - Committed legacy memo before this settlement publishes its changes
 * @returns Nothing; lazy readers still require value identity before reusing a memo
 */
export const preserveConvertedSlotMemos = <Self extends FieldNodeRecord<Self>>(
  template: BlueprintNode,
  source: Self | undefined,
  overlay: InactiveSlotOverlay | undefined,
  path: string,
  runtime: FieldNodeRuntime<Self>,
): void => {
  if (!source && !overlay) return;
  const previous = runtime.inactiveValueEntries?.get(
    JSON.stringify([path, getBlueprintNodeIdentity(template)]),
  );
  if (previous) {
    const memo = { path, value: previous.value, entry: previous.entry };
    if (source) source.inactiveValueMemo = memo;
    else if (overlay) overlay.valueMemo = memo;
  }
  for (const entry of getSlotEntries(source, overlay, template)) {
    const child = getSlotSource(source, entry, overlay);
    preserveConvertedSlotMemos(
      entry.node,
      child.source,
      child.overlay,
      path + '/' + escapeSegment(entry.name),
      runtime,
    );
  }
};
