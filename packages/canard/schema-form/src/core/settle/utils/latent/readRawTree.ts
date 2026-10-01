import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';
import { escapeSegment } from '@winglet/json/pointer';

import { getItemEntry } from '../../../blueprint';
import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { isPlain } from '../write/isPlain';
import { readLatentSlotSource } from './readLatentSlotSource';

/**
 * Compose one live item's raw tree with sources retained at gated-out paths.
 * @param node - Live item or descendant whose source channels are read
 * @param context - Settlement containing retained sources beneath the item
 * @returns Raw tree, or undefined when this subtree has no source
 */
export const readRawTree = <Self extends SchemaNodeRecord<Self>>(
  node: Self, context: SettlementContext<Self>,
): unknown => {
  if (node.raw !== undefined || node.behavior.strategy === 'terminal')
    return node.raw;
  if (node.behavior.type === 'array') {
    const slots: unknown[] = [];
    let tailStart = 0;
    let found = false;
    for (let index = 0; index < node.itemCount; index++) {
      const entry = getItemEntry(node.blueprintNode, index);
      let value: unknown;
      if (!entry) value = isArray(node.extras) ? node.extras[index - tailStart] : undefined;
      else {
        tailStart++;
        const item = node.structure?.[String(index)];
        value = item ? readRawTree(item, context) : readLatentSlotSource(context,
          `${node.path}/${index}`, entry.node);
      }
      slots.push(value);
      if (value !== undefined) found = true;
    }
    return found ? slots : undefined;
  }
  const value: Record<string, unknown> = isPlain(node.extras) ? { ...node.extras } : {};
  let found = Object.keys(value).length > 0;
  for (const entry of node.blueprintNode.childEntries) {
    if (hasOwnProperty(value, entry.name)) continue;
    const child = node.structure?.[entry.name];
    const source = child ? readRawTree(child, context) : readLatentSlotSource(context,
      `${node.path}/${escapeSegment(entry.name)}`, entry.node);
    if (source === undefined) continue;
    Object.defineProperty(value, entry.name, { value: source, enumerable: true,
      configurable: true, writable: true });
    found = true;
  }
  return found ? value : undefined;
};
