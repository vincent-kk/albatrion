import { escapeSegment } from '@winglet/json/pointer';

import { hasLiteralWildcardNode } from '../../../blueprint';
import type { BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import { getRetainedChildEntry } from './getRetainedChildEntry';
import { getSlotEntries } from './getSlotEntries';
import { getSlotSource } from './getSlotSource';
import { hasPreviousSlotWildcardMatch } from './hasPreviousSlotWildcardMatch';
import {
  hasSlotWildcardPath,
  slotWildcardQueryProofs,
} from './slotWildcardQueryProofs';

/** Preserve only the previous query membership for a rare wildcard scope. */
export const captureSlotWildcardQueries = <Self extends FieldNodeRecord<Self>>(
  host: Self,
): void => {
  if (
    !hasLiteralWildcardNode(host.blueprintNode) &&
    !hasSlotWildcardPath(host.path)
  )
    return;
  const queries = new Map<string, boolean>();
  collectSlotWildcardQueries(
    host,
    host.blueprintNode,
    host,
    undefined,
    host.path,
    queries,
  );
  if (queries.size) slotWildcardQueryProofs.set(host, queries);
};

/** Visit existing source bindings without composing raw values or recursive templates. */
const collectSlotWildcardQueries = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  template: BlueprintNode,
  source: Self | undefined,
  overlay: InactiveSlotOverlay | undefined,
  path: string,
  queries: Map<string, boolean>,
): void => {
  if (!source && !overlay) return;
  if (path !== host.path && hasSlotWildcardPath(path))
    queries.set(path, hasPreviousSlotWildcardMatch(host.rootNode, path));
  const entries = [...getSlotEntries(source, overlay, template)];
  const previousChildren = source?.deliveryPreviousChildren ?? [];
  if (source)
    for (const child of previousChildren) {
      const entry = getRetainedChildEntry(
        source,
        child.name,
        child.blueprintNode,
      );
      if (entry && !entries.includes(entry)) entries.push(entry);
    }
  for (const entry of entries) {
    const child = getSlotSource(source, entry, overlay);
    const previous = previousChildren.find(
      (node) => node.name === entry.name && node.blueprintNode === entry.node,
    );
    collectSlotWildcardQueries(
      host,
      entry.node,
      previous ?? child.source,
      child.overlay,
      path + '/' + escapeSegment(entry.name),
      queries,
    );
  }
};
