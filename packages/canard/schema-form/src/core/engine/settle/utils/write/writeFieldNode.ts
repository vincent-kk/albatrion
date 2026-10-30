import { isArray } from '@winglet/common-utils/filter';

import type { FieldNodeRecord } from '../../../record';
import type { FieldNodeWriteKind, WriteOption } from '../../../types/value';
import type { SettlementContext } from '../../types/settlement';
import { computeNode } from '../compute/computeNode';
import { registerRecalculation } from '../dependencies/registerRecalculation';
import { assertFieldNodeWritable } from '../dispose/assertFieldNodeWritable';
import { getGateRegistry } from '../gates/getGateRegistry';
import { assertVirtualWriteShape } from '../input/assertVirtualWriteShape';
import { markWrite } from '../input/markWrite';
import { prepareWriteEpoch } from '../input/utils/prepareWriteEpoch';
import { DirtyPathSet } from '../scratch/DirtyPathSet';
import { getSettlementScratch } from '../scratch/getSettlementScratch';
import { releaseSettlementScratch } from '../scratch/releaseSettlementScratch';
import { createSettlementContext } from '../settlement/createSettlementContext';
import { finishSettlement } from '../settlement/finishSettlement';
import { prepareSourcePruner } from '../slots/prepareSourcePruner';
import { collectReplacePaths } from './collectReplacePaths';
import { markWrongKindAncestors } from './markWrongKindAncestors';
import { releaseWrongKindHosts } from './releaseWrongKindHosts';

/**
 * Apply a live write; detached lifetimes have no write effect.
 * A multi-write batch arrives as one root write whose replacement scope is the union of
 * its origins' paths, not the root (191C-01).
 * @param node - Live target in a tree with a node factory
 * @param input - Caller-owned value interpreted first under static types
 * @param kind - Input origin retained for warning and transition semantics
 * @param option - Caller flags whose automatic-write bits override the form default
 * @param source - Binding origin independent of merge and replacement semantics
 * @param writeOrigins - Call-ordered batch origins for delivery and Refresh
 * @returns Nothing; live records carry the committed shape and values
 * @throws A deferred gate or shared declaration failure after commit
 */
export const writeFieldNode = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  input: unknown,
  kind: FieldNodeWriteKind,
  option: WriteOption,
  source: FieldNodeWriteKind = kind,
  writeOrigins?: SettlementContext<Self>['writeOrigins'],
): void => {
  if (node.detached) return;
  const root = node.rootNode;
  if (source === 'input' && (node.disposed || root.disposed)) return;
  const schema = node.schema.schema;
  const inputType = typeof input;
  const scalarWrite =
    node.parent !== null &&
    !node.disposed &&
    !root.disposed &&
    root.runtime.blueprint.capabilities.branchless &&
    !root.runtime.blueprint.capabilities.hasDerive &&
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
      const pruneSources = prepareSourcePruner(node);
      if (batch) {
        for (let index = 0; index < writeOrigins.length; index++) {
          const origin = writeOrigins[index];
          if (origin.source === 'automatic') continue;
          pruneSources(node.runtime, origin.path, origin.keys, context);
          if (origin.fields)
            for (const field of origin.fields)
              pruneSources(node.runtime, field, undefined, context);
        }
      } else pruneSources(node.runtime, node.path, undefined, context);
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
