import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';
import { escapeSegment } from '@winglet/json/pointer';

import { getItemEntries } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { isPlain } from '../input/isPlain';
import { DetachedWriteAddress } from '../latentStore/DetachedWriteAddress';
import { readSlotRawTree } from '../slots/readSlotRawTree';
import { resolveSlotSource } from '../slots/resolveSlotSource';
import { readAbsentSlotSource } from './readAbsentSlotSource';
import { readLatentSlotSource } from './readLatentSlotSource';

/**
 * Compose one live item's raw tree with sources retained at gated-out paths.
 * @param node - Live item or descendant whose source channels are read
 * @param context - Settlement containing retained sources beneath the item
 * @returns Raw tree, retaining every array slot; undefined for an empty-source
 * object or leaf
 */
export const readRawTree = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): unknown => {
  if (node.runtime.slots !== 'off') {
    if (
      !node.detached &&
      !node.runtime.latentRaw.pathIndex.under(node.path).size
    )
      return readSlotRawTree(node.blueprintNode, node);
    if (node.detached) {
      const lineage = [];
      for (let current: Self | null = node; current; current = current.parent)
        lineage.unshift(current.blueprintNode);
      const resolved = resolveSlotSource(
        context.root,
        DetachedWriteAddress.read(node)?.path ?? node.path,
        node.blueprintNode,
        lineage,
      );
      if (resolved.source || resolved.overlay)
        return readSlotRawTree(
          node.blueprintNode,
          resolved.source,
          resolved.overlay,
        );
      const latent = readLatentSlotSource(
        context,
        DetachedWriteAddress.read(node)?.path ?? node.path,
        node.blueprintNode,
      );
      return latent === undefined
        ? readSlotRawTree(node.blueprintNode, node)
        : latent;
    }
  }
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
          ? readRawTree(item, context)
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
      ? readRawTree(child, context)
      : readLatentSlotSource(
          context,
          node.path + '/' + escapeSegment(entry.name),
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
