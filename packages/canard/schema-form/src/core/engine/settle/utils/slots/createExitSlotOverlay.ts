import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { BlueprintChildEntry } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { captureAbsentSlotInputs } from './captureAbsentSlotInputs';
import { createClearedArrayOverlay } from './createClearedArrayOverlay';
import { discardClearedArrayItems } from './discardClearedArrayItems';
import { expirePackedSlotMemos } from './expirePackedSlotMemos';
import { getRetainedChildEntry } from './getRetainedChildEntry';
import { hasSlotOverlaySource } from './hasSlotOverlaySource';
import { readSlotExitPolicy } from './readSlotExitPolicy';

/** Source-preservation result for one recursively resolved exit policy. */
interface ExitSlotOverlay {
  /** Patch that excludes cleared channels without changing the old instance. */
  readonly overlay: InactiveSlotOverlay | undefined;
  /** Whether this host has a kept own channel or a kept descendant source. */
  readonly hasSource: boolean;
  /** Whether this instance can remain a slot, including empty kept occurrences. */
  readonly retain: boolean;
  /** Whether a nested clearing array requires a privately rebound source graph. */
  readonly compacted?: boolean;
}

/**
 * Resolve source clearing as a patch over a detached instance subtree.
 * @param node - Immutable source whose active and inactive descendants are retained
 * @param inherited - Last-live ancestor policy at this source position
 * @param applyPolicy - Whether this exit may perform automatic source clearing
 * @param previous - Existing patch over this source, if a parent already owns one
 * @param context - Active exit inputs, omitted for already inactive descendants
 * @param sourceContext - Exit plan owner, also shared with already inactive descendants
 * @returns A patch and retention decision; no raw, extras, or public reads are mutated
 */
export const createExitSlotOverlay = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  inherited: boolean,
  applyPolicy: boolean,
  previous?: InactiveSlotOverlay,
  context?: SettlementContext<Self>,
  sourceContext = context,
): ExitSlotOverlay => {
  const supplied = context ? captureAbsentSlotInputs(node, context) : undefined;
  if (supplied?.children)
    previous = {
      ...previous,
      children: new Map([...(previous?.children ?? []), ...supplied.children]),
    };
  const policy = readSlotExitPolicy(node, inherited);
  const clear = applyPolicy && policy;
  if (
    clear &&
    node.behavior.type === 'array' &&
    !node.blueprintNode.hasKeepDescendants
  ) {
    if (sourceContext) discardClearedArrayItems(node);
    const overlay = {
      replace: true,
      raw: undefined,
      undeclaredValues: undefined,
      itemCount: 0,
    };
    if (context) node.retainedSourceOverlay = overlay;
    return { overlay, hasSource: false, retain: false };
  }
  if (clear && node.behavior.type === 'array') {
    const overlay = createClearedArrayOverlay(
      node,
      previous,
      context,
      createExitSlotOverlay,
      sourceContext,
    );
    if (context) node.retainedSourceOverlay = overlay;
    const hasSource = overlay.itemCount !== 0;
    if (!hasSource && sourceContext) discardClearedArrayItems(node);
    return { overlay, hasSource, retain: hasSource, compacted: hasSource };
  }
  const raw =
    previous && hasOwnProperty(previous, 'raw')
      ? previous?.raw
      : previous?.replace
        ? undefined
        : node.raw;
  const extras =
    previous && hasOwnProperty(previous, 'undeclaredValues')
      ? previous?.undeclaredValues
      : previous?.replace
        ? undefined
        : node.undeclaredValues;
  let hasSource =
    !clear &&
    (raw !== undefined ||
      extras !== undefined ||
      node.behavior.type === 'array');
  let children: Map<BlueprintChildEntry, InactiveSlotOverlay> | undefined;
  let compacted = false;
  const visited: BlueprintChildEntry[] = [];
  for (const child of node.children ?? []) {
    if (child.parent !== node) continue;
    const entry = getRetainedChildEntry(node, child.name, child.blueprintNode);
    if (!entry) continue;
    visited.push(entry);
    const prior = previous?.children?.get(entry);
    const result = createExitSlotOverlay(
      child,
      clear,
      applyPolicy,
      prior,
      context,
      sourceContext,
    );
    if (result.hasSource) hasSource = true;
    if (result.compacted) compacted = true;
    if (result.overlay !== prior) {
      children ??= new Map(previous?.children);
      if (result.overlay) children.set(entry, result.overlay);
      else children.delete(entry);
    }
  }
  for (const [entry, child] of node.inactiveSlots ?? []) {
    if (visited.includes(entry)) continue;
    visited.push(entry);
    const prior =
      previous?.children?.get(entry) ?? node.inactiveSlotOverlays?.get(entry);
    const result = createExitSlotOverlay(
      child,
      clear,
      applyPolicy,
      prior,
      undefined,
      sourceContext,
    );
    if (result.hasSource) hasSource = true;
    if (result.compacted) compacted = true;
    if (result.overlay !== previous?.children?.get(entry)) {
      children ??= new Map(previous?.children);
      if (result.overlay) children.set(entry, result.overlay);
    }
  }
  for (const [entry, prior] of node.inactiveSlotOverlays ?? []) {
    if (visited.includes(entry)) continue;
    if (!clear && hasSlotOverlaySource(prior)) hasSource = true;
    const overlay = clear
      ? { replace: true, raw: undefined, undeclaredValues: undefined }
      : prior;
    if (overlay !== previous?.children?.get(entry)) {
      children ??= new Map(previous?.children);
      children.set(entry, overlay);
    }
  }
  const overlay = clear
    ? {
        ...previous,
        raw: undefined,
        undeclaredValues: undefined,
        ...(node.behavior.type === 'array' ? { itemCount: 0 } : undefined),
        ...(children ? { children } : undefined),
      }
    : children
      ? { ...previous, children }
      : previous;
  if (context) node.retainedSourceOverlay = overlay;
  if (!clear && node.behavior.type === 'array' && node.raw === undefined)
    expirePackedSlotMemos(node, overlay);
  return { overlay, hasSource, retain: !clear || hasSource, compacted };
};
