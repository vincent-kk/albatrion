import { hasOwnProperty } from '@winglet/common-utils/lib';
import { unescapeSegment } from '@winglet/json/pointer';

import { isTestFieldNode } from '../../../../__tests__/fixtures/testFieldNode';
import type { TestFieldNode } from '../../../../__tests__/fixtures/testFieldNode';
import type { BlueprintChildEntry, BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import { getBlueprintNodeIdentity } from '../../../utils/nodeIdentity/getBlueprintNodeIdentity';
import { getSlotEntries } from '../../utils/slots/getSlotEntries';
import { getSlotSource } from '../../utils/slots/getSlotSource';
import { readSlotRawTree } from '../../utils/slots/readSlotRawTree';

/**
 * Inspect the source channels of one retained candidate in a slot contract test.
 * @param root - Current live root owning the retained source graph
 * @param path - Absolute path of the inactive candidate
 * @param token - Blueprint kind identity, including union folds
 * @returns The candidate's interpreted raw tree, or undefined when no source is retained
 */
const findRetainedSlot = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  path: string,
  token?: string,
):
  | {
      entry: BlueprintChildEntry;
      template: BlueprintNode;
      source: Self | undefined;
      overlay: InactiveSlotOverlay | undefined;
    }
  | undefined => {
  root = root.rootNode;
  const names = path.split('/').slice(1).map(unescapeSegment);
  const visit = (
    source: Self | undefined,
    overlay: InactiveSlotOverlay | undefined,
    template: BlueprintNode,
    depth: number,
  ):
    | {
        entry: BlueprintChildEntry;
        template: BlueprintNode;
        source: Self | undefined;
        overlay: InactiveSlotOverlay | undefined;
      }
    | undefined => {
    for (const entry of getSlotEntries(source, overlay, template)) {
      if (entry.name !== names[depth]) continue;
      const child = getSlotSource(source, entry, overlay);
      if (depth === names.length - 1) {
        if (
          token !== undefined &&
          getBlueprintNodeIdentity(entry.node) !== token
        )
          continue;
        if (child.source && !child.source.detached) continue;
        if (!child.overlay && !child.source) continue;
        return { entry, template: entry.node, ...child };
      }
      const value = visit(child.source, child.overlay, entry.node, depth + 1);
      if (value !== undefined) return value;
    }
    return undefined;
  };
  return visit(root, undefined, root.blueprintNode, 0);
};

/** Read one inactive candidate's interpreted raw tree for a slot contract assertion. */
export const readRetainedSlotRaw = (
  root: unknown,
  path: string,
  token?: string,
): unknown => {
  const retained = findRetainedSlot(requireRecord(root), path, token);
  return retained
    ? readSlotRawTree(retained.template, retained.source, retained.overlay)
    : undefined;
};

/** Check own source channels while object descendants remain independently retained. */
export const hasRetainedSlotOwnSource = (
  root: unknown,
  path: string,
  token?: string,
): boolean => {
  const retained = findRetainedSlot(requireRecord(root), path, token);
  if (!retained) return false;
  if (retained.template.kind === 'array')
    return (
      readSlotRawTree(retained.template, retained.source, retained.overlay) !==
      undefined
    );
  const { source, overlay } = retained;
  const raw =
    overlay && hasOwnProperty(overlay, 'raw')
      ? overlay.raw
      : overlay?.replace
        ? undefined
        : source?.raw;
  const extras =
    overlay && hasOwnProperty(overlay, 'undeclaredValues')
      ? overlay.undeclaredValues
      : overlay?.replace
        ? undefined
        : source?.undeclaredValues;
  return raw !== undefined || extras !== undefined;
};

/** Read the actual retained candidate binding for a slot ownership assertion. */
export const readRetainedSlotEntry = (
  root: unknown,
  path: string,
  token?: string,
): BlueprintChildEntry | undefined =>
  findRetainedSlot(requireRecord(root), path, token)?.entry;

/** Narrow test-only public references before inspecting their runtime slot contract. */
const requireRecord = (value: unknown): TestFieldNode => {
  if (!isTestFieldNode(value))
    throw new Error('Expected a node runtime record');
  return value;
};
