import type { Optional } from '@aileron/declare';

import type { BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import { getSlotPathEntry } from './getSlotPathEntry';
import { getSlotPathNames } from './getSlotPathNames';
import { getSlotSource } from './getSlotSource';

/**
 * Resolve current source channels through live hosts and retained candidates.
 * @param root - Current tree root
 * @param path - Absolute source address
 * @param target - Exact kind requested at the final position
 * @returns Retained or live occurrence and its owner-held patch
 */
export const resolveSlotSource = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  path: string,
  target: BlueprintNode,
): { source: Optional<Self>; overlay: Optional<InactiveSlotOverlay> } => {
  const names = getSlotPathNames(root.runtime, path);
  if (names === undefined) return { source: undefined, overlay: undefined };
  let template = root.blueprintNode;
  let source: Optional<Self> = root;
  let overlay: Optional<InactiveSlotOverlay>;
  for (let depth = 0; depth < names.length; depth++) {
    const name = names[depth];
    const selected =
      depth === names.length - 1
        ? target
        : source?.structure?.[name]?.blueprintNode;
    const entry = getSlotPathEntry(template, source, overlay, name, selected);
    if (!entry) return { source: undefined, overlay: undefined };
    const child: {
      source: Optional<Self>;
      overlay: Optional<InactiveSlotOverlay>;
    } = getSlotSource(source, entry, overlay);
    source = child.source;
    overlay = child.overlay;
    template = entry.node;
  }
  return { source, overlay };
};
