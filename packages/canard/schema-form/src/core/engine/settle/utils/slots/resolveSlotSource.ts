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
): { instance: Optional<Self>; overlay: Optional<InactiveSlotOverlay> } => {
  const names = getSlotPathNames(root.runtime, path);
  if (names === undefined) return { instance: undefined, overlay: undefined };
  let template = root.blueprintNode;
  let instance: Optional<Self> = root;
  let overlay: Optional<InactiveSlotOverlay>;
  for (let depth = 0; depth < names.length; depth++) {
    const name = names[depth];
    const selected =
      depth === names.length - 1
        ? target
        : instance?.structure?.[name]?.blueprintNode;
    const entry = getSlotPathEntry(template, instance, overlay, name, selected);
    if (!entry) return { instance: undefined, overlay: undefined };
    const child: {
      instance: Optional<Self>;
      overlay: Optional<InactiveSlotOverlay>;
    } = getSlotSource(instance, entry, overlay);
    instance = child.instance;
    overlay = child.overlay;
    template = entry.node;
  }
  return { instance, overlay };
};
