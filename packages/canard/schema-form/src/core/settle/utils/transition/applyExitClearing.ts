import { hasOwnProperty } from '@winglet/common-utils/lib';
import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { captureExitedRaw } from './captureExitedRaw';
import { captureLatentDescendants } from './captureLatentDescendants';
import { readUnsetPolicy } from './readUnsetPolicy';
import { writeLatentRaw } from './writeLatentRaw';
import { readDepartingAncestorPolicy } from './readDepartingAncestorPolicy';
import { isReplacedLivePath } from './isReplacedLivePath';

/**
 * Clear exited raw under node and form policies without changing extras.
 * @param context - Shape exits observed against the previous commit
 * @returns Nothing; changed live parents are scheduled for recalculation
 */
export const applyExitClearing = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  if (context.kind === 'load') return;
  for (const node of context.exited) {
    if (context.entered.has(node) || !node.detached) continue;
    const inherited = readDepartingAncestorPolicy(context, node);
    const retained = captureLatentDescendants(context, node,
      captureExitedRaw(node, inherited, context),
      readUnsetPolicy(node, inherited));
    writeLatentRaw(context, JSON.stringify([node.path, node.blueprintNode.kind]),
      retained !== undefined && !isReplacedLivePath(context, node.path), retained);
    if (Object.is(retained, node.raw)) continue;
    const parent = node.parent;
    if (parent?.structure?.[node.name] && parent.structure[node.name] !== node)
      continue;
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
