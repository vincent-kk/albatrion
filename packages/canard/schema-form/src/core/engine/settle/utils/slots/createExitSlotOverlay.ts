import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Optional } from '@aileron/declare';

import type { BlueprintChildEntry } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { captureAbsentSlotInputs } from './captureAbsentSlotInputs';
import { createClearedArrayOverlay } from './createClearedArrayOverlay';
import { expirePackedSlotMemos } from './expirePackedSlotMemos';
import { getRetainedChildEntry } from './getRetainedChildEntry';
import { hasSlotOverlaySource } from './hasSlotOverlaySource';
import { readSlotExitPolicy } from './readSlotExitPolicy';
import { readExitInputOverlays } from './utils/readExitInputOverlays';

/** Source-preservation result for one recursively resolved exit policy. */
interface ExitSlotOverlay {
  /** Patch that excludes cleared channels without changing the old instance. */
  readonly overlay: Optional<InactiveSlotOverlay>;
  /** Whether this host has a kept own channel or a kept descendant source. */
  readonly hasSource: boolean;
  /** Whether this instance can remain a slot, including empty kept occurrences. */
  readonly canRetain: boolean;
  /** Whether a nested clearing array requires a privately rebound source graph. */
  readonly isCompacted?: boolean;
}

/**
 * Resolve source clearing as a patch over a detached instance subtree.
 * @param node - Immutable source whose active and inactive descendants are retained
 * @param inherited - Last-live ancestor policy at this source position
 * @param applyPolicy - Whether this exit may perform automatic source clearing
 * @param previous - Existing patch over this source, if a parent already owns one
 * @param context - Active exit inputs, omitted for already inactive descendants
 * @param sourceContext - Exit plan owner, also shared with already inactive descendants
 * @returns A patch and retention decision; no source, extras, or public reads are mutated
 */
export const createExitSlotOverlay = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  inherited: boolean,
  applyPolicy: boolean,
  previous?: InactiveSlotOverlay,
  context?: SettlementContext<Self>,
  sourceContext = context,
): ExitSlotOverlay => {
  const retained = context?.retainedSources?.get(node);
  if (retained?.shouldUseBaseline && !context?.exceededBudget)
    previous = {
      ...(retained.source !== node.source
        ? { source: retained.source }
        : undefined),
      ...(retained.extras !== node.extras
        ? { extras: retained.extras }
        : undefined),
      ...previous,
    };
  const supplied =
    context &&
    readExitInputOverlays(
      node,
      context.exceededBudget || retained?.shouldUseBaseline
        ? undefined
        : context.retainedArrays?.get(node),
      captureAbsentSlotInputs(node, context)?.children,
    );
  if (supplied)
    previous = {
      ...previous,
      children: new Map([...(previous?.children ?? []), ...supplied]),
    };
  const policy = readSlotExitPolicy(node, inherited);
  const clear = applyPolicy && policy;
  if (
    clear &&
    node.behavior.type === 'array' &&
    !node.blueprintNode.hasKeepDescendants
  ) {
    const overlay = {
      isWhole: true,
      source: undefined,
      extras: undefined,
      itemCount: 0,
    };
    if (context) node.retainedSourceOverlay = overlay;
    return { overlay, hasSource: false, canRetain: false };
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
    return { overlay, hasSource, canRetain: hasSource, isCompacted: hasSource };
  }
  const source =
    previous && hasOwnProperty(previous, 'source')
      ? previous?.source
      : previous?.isWhole
        ? undefined
        : node.source;
  const extras =
    previous && hasOwnProperty(previous, 'extras')
      ? previous?.extras
      : previous?.isWhole
        ? undefined
        : node.extras;
  let hasSource =
    !clear &&
    (context?.inactiveValueOverrides?.has(node) ||
      source !== undefined ||
      extras !== undefined ||
      node.behavior.type === 'array');
  let children: Optional<Map<BlueprintChildEntry, InactiveSlotOverlay>>;
  let isCompacted = false;
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
    if (result.isCompacted) isCompacted = true;
    if (result.overlay !== prior) {
      children ??= new Map(previous?.children);
      if (result.overlay) children.set(entry, result.overlay);
      else children.delete(entry);
    }
  }
  for (const [entry, child] of node.inactiveSlots ?? []) {
    if (visited.indexOf(entry) !== -1) continue;
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
    if (result.isCompacted) isCompacted = true;
    if (result.overlay !== previous?.children?.get(entry)) {
      children ??= new Map(previous?.children);
      if (result.overlay) children.set(entry, result.overlay);
    }
  }
  for (const [entry, prior] of node.inactiveSlotOverlays ?? []) {
    if (visited.indexOf(entry) !== -1) continue;
    if (!clear && hasSlotOverlaySource(prior)) hasSource = true;
    const overlay = clear
      ? { isWhole: true, source: undefined, extras: undefined }
      : prior;
    if (overlay !== previous?.children?.get(entry)) {
      children ??= new Map(previous?.children);
      children.set(entry, overlay);
    }
  }
  const overlay = clear
    ? {
        ...previous,
        source: undefined,
        extras: undefined,
        ...(node.behavior.type === 'array' ? { itemCount: 0 } : undefined),
        ...(children ? { children } : undefined),
      }
    : children
      ? { ...previous, children }
      : previous;
  if (context) node.retainedSourceOverlay = overlay;
  if (!clear && node.behavior.type === 'array' && node.source === undefined)
    expirePackedSlotMemos(node, overlay);
  return {
    overlay,
    hasSource,
    canRetain: !clear || hasSource,
    isCompacted,
  };
};
