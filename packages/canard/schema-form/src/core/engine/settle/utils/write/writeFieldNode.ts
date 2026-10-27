import { isArray } from '@winglet/common-utils/filter';

import type { FieldNodeRecord } from '../../../record';
import type { WriteOption } from '../../../types/value';
import type { FieldNodeWriteKind } from '../../../types/value';
import { getBlueprintNodeIdentity } from '../../../utils/nodeIdentity/getBlueprintNodeIdentity';
import type { SettlementContext } from '../../types/settlement';
import { computeNode } from '../compute/computeNode';
import { registerRecalculation } from '../dependencies/registerRecalculation';
import { hasLivePathKind } from '../detached/hasLivePathKind';
import { assertFieldNodeWritable } from '../dispose/assertFieldNodeWritable';
import { getGateRegistry } from '../gates/getGateRegistry';
import { assertVirtualWriteShape } from '../input/assertVirtualWriteShape';
import { isPlain } from '../input/isPlain';
import { markWrite } from '../input/markWrite';
import { prepareWriteEpoch } from '../input/utils/prepareWriteEpoch';
import { distributeLatentValue } from '../latent/distributeLatentValue';
import { DetachedWriteAddress } from '../latentStore/DetachedWriteAddress';
import { getLatentOrder } from '../latentStore/getLatentOrder';
import { pruneLatentRaw } from '../latentStore/pruneLatentRaw';
import { DirtyPathSet } from '../scratch/DirtyPathSet';
import { getSettlementScratch } from '../scratch/getSettlementScratch';
import { releaseSettlementScratch } from '../scratch/releaseSettlementScratch';
import { createSettlementContext } from '../settlement/createSettlementContext';
import { finishSettlement } from '../settlement/finishSettlement';
import { resolveSlotSource } from '../slots/resolveSlotSource';
import { writeSlotPath } from '../slots/writeSlotPath';
import { prepareSlotShadow } from '../verify/prepareSlotShadow';
import { collectReplacePaths } from './collectReplacePaths';
import { markWrongKindAncestors } from './markWrongKindAncestors';
import { releaseWrongKindHosts } from './releaseWrongKindHosts';

/**
 * Apply a live write or an own-kind detached latent write (26C-14).
 * A multi-write batch arrives as one root write whose replacement scope is the union of
 * its origins' paths, not the root (191C-01).
 * @param node - Live target or detached reference in a tree with a node factory
 * @param input - Caller-owned value interpreted first under static types
 * @param kind - Input origin retained for warning and transition semantics
 * @param option - Caller flags whose automatic-write bits override the form default
 * @param source - Binding origin independent of merge and replacement semantics
 * @param writeOrigins - Call-ordered batch origins for delivery and Refresh
 * @returns Nothing; live records carry the committed shape and values
 * @throws A deferred gate or shared declaration failure after commit
 */
const writeFieldNodeBody = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  input: unknown,
  kind: FieldNodeWriteKind,
  option: WriteOption,
  source: FieldNodeWriteKind = kind,
  writeOrigins?: SettlementContext<Self>['writeOrigins'],
): void => {
  const root = node.rootNode;
  if (source === 'input' && (node.disposed || root.disposed)) return;
  const schema = node.schema.schema;
  const inputType = typeof input;
  const scalarWrite =
    node.parent !== null &&
    !node.detached &&
    !node.disposed &&
    !root.disposed &&
    root.runtime.blueprint.capabilities.branchless &&
    !root.runtime.blueprint.capabilities.hasDerive &&
    (root.runtime.latentRaw.size === 0 ||
      (root.runtime.latentRaw.pathIndex.under(node.path).size === 0 &&
        root.runtime.latentRaw.pathIndex.intersecting(node.path).size === 0)) &&
    (kind === 'input' ||
      kind === 'callerReplace' ||
      kind === 'callerPartial') &&
    (inputType === 'string' ||
      inputType === 'boolean' ||
      inputType === 'number') &&
    node.schemaType === inputType &&
    typeof node.raw === inputType &&
    (inputType !== 'number' ||
      (Number.isFinite(input) && Number.isFinite(node.raw))) &&
    typeof schema === 'object' &&
    schema !== null &&
    schema.type === node.schemaType;
  if (!scalarWrite) {
    assertFieldNodeWritable(node);
    if (
      node.behavior.type === 'virtual' &&
      kind !== 'load' &&
      kind !== 'automatic'
    )
      assertVirtualWriteShape(node, input);
  }
  if (!scalarWrite && node.detached) {
    const address = DetachedWriteAddress.read(node);
    const path = address?.path ?? node.path;
    if (hasLivePathKind(node, path)) return;
    const whole =
      kind !== 'callerPartial' ||
      !isPlain(input) ||
      node.behavior.strategy !== 'branch';
    if (node.runtime.slots !== 'off') {
      const lineage = [];
      for (let current: Self | null = node; current; current = current.parent)
        lineage.unshift(current.blueprintNode);
      const resolved = resolveSlotSource(
        root,
        path,
        node.blueprintNode,
        lineage,
      );
      if (resolved.source || resolved.overlay || !node.runtime.latentRaw.size) {
        writeSlotPath(
          root,
          path,
          node.blueprintNode,
          input,
          whole,
          undefined,
          lineage,
        );
        return;
      }
    }
    if (whole) pruneLatentRaw(node.rootNode.runtime, path);
    distributeLatentValue(
      node.rootNode.runtime,
      undefined,
      path,
      node.blueprintNode,
      input,
      address?.order ??
        getLatentOrder(node.parent, node.name, node.blueprintNode),
      whole,
      node.parent?.blueprintNode.childEntries ?? [],
    );
    const metadata = node.runtime.latentRawMetadata?.get(
      JSON.stringify([path, getBlueprintNodeIdentity(node.blueprintNode)]),
    );
    if (metadata) DetachedWriteAddress.retain(node, metadata, node.runtime);
    return;
  }
  const scratch = getSettlementScratch(root.runtime);
  const replaces = scalarWrite
    ? kind !== 'input'
    : kind === 'callerReplace' ||
      (kind === 'input' && node.behavior.strategy === 'branch') ||
      (kind === 'callerPartial' &&
        (input === null ||
          typeof input !== 'object' ||
          isArray(input) ||
          node.behavior.strategy !== 'branch'));
  const batch = writeOrigins !== undefined && writeOrigins.length > 1;
  const context = createSettlementContext(
    node,
    kind,
    option,
    scratch,
    replaces && !batch,
  );
  context.source = source;
  context.writeOrigins = writeOrigins;
  if (batch) context.replacePaths = collectReplacePaths(writeOrigins);
  if (!scalarWrite && replaces) prepareWriteEpoch(context);
  try {
    if (context.hasGates)
      getGateRegistry(context.root.runtime).register(context.root);
    if (!scalarWrite && (replaces || kind === 'load')) {
      if (batch) {
        for (let index = 0; index < writeOrigins.length; index++) {
          const origin = writeOrigins[index];
          if (origin.source === 'automatic') continue;
          pruneLatentRaw(node.runtime, origin.path, origin.keys, context);
          if (origin.fields)
            for (const field of origin.fields)
              pruneLatentRaw(node.runtime, field, undefined, context);
        }
      } else pruneLatentRaw(node.runtime, node.path, undefined, context);
    }
    if (
      !context.hasGates &&
      context.dirtyPaths instanceof DirtyPathSet &&
      !context.dirtyPaths.isPostOrder
    )
      context.dirtyPaths.beginPostOrder();
    markWrite(node, input, context);
    if (kind !== 'load' && kind !== 'automatic')
      markWrongKindAncestors(node, context);
    registerRecalculation(context);
    computeNode(context.root, context);
    if (!scalarWrite || context.wrongKindHosts.size > 0)
      releaseWrongKindHosts(context);
    finishSettlement(context, scratch, scalarWrite);
  } finally {
    releaseSettlementScratch(scratch);
  }
};

/** Replay resolved inputs only in verification mode, preserving the ordinary entry. */
export const writeFieldNode = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  input: unknown,
  kind: FieldNodeWriteKind,
  option: WriteOption,
  source: FieldNodeWriteKind = kind,
  writeOrigins?: SettlementContext<Self>['writeOrigins'],
): void => {
  if (node.runtime.slots !== 'verify')
    return writeFieldNodeBody(node, input, kind, option, source, writeOrigins);
  const complete = prepareSlotShadow(node, (shadow) =>
    writeFieldNode(shadow, input, kind, option, source, writeOrigins),
  );
  let failure: unknown;
  try {
    return writeFieldNodeBody(node, input, kind, option, source, writeOrigins);
  } catch (error) {
    failure = error;
    throw error;
  } finally {
    complete?.(failure);
  }
};
