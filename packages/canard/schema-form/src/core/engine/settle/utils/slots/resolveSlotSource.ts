import { parsePointer } from '@/schema-form/helpers/jsonPointer';

import type { BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import { getSlotPathEntry } from './getSlotPathEntry';
import { getSlotSource } from './getSlotSource';

/**
 * Resolve current source channels through live hosts and retained candidates.
 * @param root - Current tree root
 * @param path - Absolute source address
 * @param target - Exact kind requested at the final position
 * @param lineage - Optional old-reference blueprint chain for ancestor kinds
 * @returns Retained or live occurrence and its owner-held patch
 */
export const resolveSlotSource = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  path: string,
  target: BlueprintNode,
  lineage?: readonly BlueprintNode[],
): { source: Self | undefined; overlay: InactiveSlotOverlay | undefined } => {
  const names = parsePointer(path).segments;
  if (!names.every((segment): segment is string => typeof segment === 'string'))
    return { source: undefined, overlay: undefined };
  let template = root.blueprintNode;
  let source: Self | undefined = root;
  let overlay: InactiveSlotOverlay | undefined;
  for (let depth = 0; depth < names.length; depth++) {
    const name = names[depth];
    const selected =
      depth === names.length - 1
        ? target
        : (lineage?.[depth + 1] ?? source?.structure?.[name]?.blueprintNode);
    const entry = getSlotPathEntry(template, source, overlay, name, selected);
    if (!entry) return { source: undefined, overlay: undefined };
    const child: {
      source: Self | undefined;
      overlay: InactiveSlotOverlay | undefined;
    } = getSlotSource(source, entry, overlay);
    source = child.source;
    overlay = child.overlay;
    template = entry.node;
  }
  return { source, overlay };
};
