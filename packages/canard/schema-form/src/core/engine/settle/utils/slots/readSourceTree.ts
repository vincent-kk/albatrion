import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import { getItemEntries } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { isPlain } from '../input/isPlain';
import { readAbsentSlotSource } from './readAbsentSlotSource';
import { readInactiveSlotSource } from './readInactiveSlotSource';
import { readSlotRawTree } from './readSlotRawTree';

/**
 * Compose one live item's raw tree with sources retained at gated-out paths.
 * @param node - Live or detached occurrence whose source channels are read
 * @param context - Settlement containing retained sources beneath the item
 * @returns Raw tree, retaining every array slot; undefined for an empty-source
 * object or leaf; detached occurrences use their frozen source channels
 */
export const readSourceTree = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): unknown => {
  if (node.detached)
    return readSlotRawTree(node.blueprintNode, node, undefined);
  if (node.raw !== undefined || node.behavior.strategy === 'terminal')
    return node.raw;
  if (node.behavior.type === 'array') {
    const slots: unknown[] = [];
    let tailStart = 0;
    for (let index = 0; index < node.itemCount; index++) {
      const candidates = getItemEntries(node.blueprintNode, index);
      let value: unknown;
      if (candidates.length === 0)
        value = isArray(node.undeclaredValues)
          ? node.undeclaredValues[index - tailStart]
          : undefined;
      else {
        tailStart++;
        const item = node.structure?.[String(index)];
        value = item
          ? readSourceTree(item, context)
          : readAbsentSlotSource(node, index, candidates, context);
      }
      slots.push(value);
    }
    return slots;
  }
  const value: Record<string, unknown> = isPlain(node.undeclaredValues)
    ? { ...node.undeclaredValues }
    : {};
  let found = Object.keys(value).length > 0;
  for (const entry of node.blueprintNode.childEntries) {
    if (hasOwnProperty(value, entry.name)) continue;
    const child = node.structure?.[entry.name];
    const source = child
      ? readSourceTree(child, context)
      : readInactiveSlotSource(
          context,
          appendSegment(node.path, entry.name),
          entry.node,
        );
    if (source === undefined) continue;
    Object.defineProperty(value, entry.name, {
      value: source,
      enumerable: true,
      configurable: true,
      writable: true,
    });
    found = true;
  }
  return found ? value : undefined;
};
