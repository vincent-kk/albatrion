import { hasOwnProperty } from '@winglet/common-utils/lib';
import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { captureExitedRaw } from './captureExitedRaw';
import { captureLatentDescendants } from './captureLatentDescendants';
import { readUnsetPolicy } from './readUnsetPolicy';
import { writeLatentRaw } from './writeLatentRaw';
import { readDepartingAncestorPolicy } from './readDepartingAncestorPolicy';

/**
 * Clear exited raw under node and form policies without changing extras.
 * @param context - Shape exits observed against the previous commit
 * @param cleared - Exits already processed in earlier transition rounds
 * @returns Nothing; changed live parents are scheduled for recalculation
 */
export const applyExitClearing = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>, cleared: Set<Self>,
): void => {
  if (context.kind === 'load') return;
  for (const node of context.exited) {
    if (cleared.has(node) || context.entered.has(node) || !node.detached) continue;
    cleared.add(node);
    const inherited = readDepartingAncestorPolicy(context, node);
    const retained = captureLatentDescendants(context, node,
      captureExitedRaw(node, inherited, context),
      readUnsetPolicy(node, inherited));
    writeLatentRaw(context, JSON.stringify([node.path, node.blueprintNode.kind]),
      retained !== undefined, retained);
    if (Object.is(retained, node.raw)) continue;
    const parent = node.parent;
    if (!parent || parent.raw === null || typeof parent.raw !== 'object' ||
      Array.isArray(parent.raw)) continue;
    const next = { ...parent.raw };
    if (retained === undefined) {
      if (hasOwnProperty(next, node.name)) Reflect.deleteProperty(next, node.name);
    } else Reflect.set(next, node.name, retained);
    context.automaticLog.push({ node: parent, previousRaw: parent.raw,
      previousExtras: parent.extras });
    parent.raw = next;
    context.changedRaw.add(parent.path);
    context.shapeDirtyPaths.add(parent.path);
    context.automaticChanged = true;
  }
};
