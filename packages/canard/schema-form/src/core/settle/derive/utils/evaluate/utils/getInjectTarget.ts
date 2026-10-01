import { hasOwnProperty } from '@winglet/common-utils/lib';
import { unescapeSegment } from '@winglet/json/pointer';

import type { SchemaNodeRecord } from '../../../../../record';
import { getDeriveChildEntry } from '../../rank/getDeriveChildEntry';

/**
 * Resolve a dynamic path through declared templates and the current shape.
 * @param root - Live calculated root
 * @param path - Absolute target pointer, never the context token
 * @returns Declared target and optional live occurrence
 */
export const getInjectTarget = <Self extends SchemaNodeRecord<Self>>(
  root: Self, path: string,
) => {
  if (path === '@') return undefined;
  let template = root.blueprintNode;
  let live: Self | undefined = root;
  let siblings = template.childEntries;
  const order: number[] = [];
  for (const encoded of path.split('/').slice(1)) {
    if (template.strategy !== 'branch') return undefined;
    const name = unescapeSegment(encoded);
    siblings = template.childEntries;
    const found = getDeriveChildEntry(template, name);
    if (!found) return undefined;
    order.push(found.position);
    const structure: Record<string, Self> | null = live?.structure ?? null;
    live = structure && hasOwnProperty(structure, name) ? structure[name] : undefined;
    template = live?.blueprintNode ?? found.entry.node;
  }
  return { target: live, template: live?.blueprintNode ?? template, siblings, order };
};
