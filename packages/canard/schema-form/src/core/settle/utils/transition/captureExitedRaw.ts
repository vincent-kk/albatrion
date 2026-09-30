import { hasOwnProperty } from '@winglet/common-utils/lib';
import type { SchemaNodeRecord } from '../../../record';
import { readUnsetPolicy } from './readUnsetPolicy';
import type { SettlementContext } from '../../type';
import { writeLatentRaw } from './writeLatentRaw';
import { getLatentOrder } from '../latent/getLatentOrder';

/**
 * Preserve or clear an exited declaration tree under its nearest policy.
 * @param node - Detached occurrence, including its last committed children
 * @param inherited - Parent or form policy active at this depth
 * @returns Source to retain for a future occurrence of this node
 */
export const captureExitedRaw = <Self extends SchemaNodeRecord<Self>>(
  node: Self, inherited: boolean, context: SettlementContext<Self>,
): unknown => {
  const clear = readUnsetPolicy(node, inherited);
  let retained: unknown = clear ? undefined : node.raw;
  for (const child of node.children ?? []) {
    const childRaw = captureExitedRaw(child, clear, context);
    if (clear || retained === null || typeof retained !== 'object' ||
      Array.isArray(retained) || Object.is(childRaw, child.raw)) continue;
    const copy = { ...retained };
    if (childRaw === undefined) {
      if (hasOwnProperty(copy, child.name)) Reflect.deleteProperty(copy, child.name);
    } else Reflect.set(copy, child.name, childRaw);
    retained = copy;
  }
  const key = JSON.stringify([node.path, node.blueprintNode.kind]);
  writeLatentRaw(context, key, retained !== undefined, retained,
    node.blueprintNode, getLatentOrder(node.parent, node.name, node.blueprintNode));
  return retained;
};
