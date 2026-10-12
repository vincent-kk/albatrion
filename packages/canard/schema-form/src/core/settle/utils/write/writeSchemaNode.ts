import { isArray } from '@winglet/common-utils/filter';

import type { SchemaNodeRecord } from '../../../record';
import type { SetValueOption } from '../../../types/value';
import type { SchemaNodeWriteKind, SettlementContext } from '../../type';
import { computeNode } from '../compute/computeNode';
import { hasLivePathKind } from '../detached/hasLivePathKind';
import { assertSchemaNodeWritable } from '../dispose/assertSchemaNodeWritable';
import { getGateRegistry } from '../gates/getGateRegistry';
import { distributeLatentValue } from '../latent/distributeLatentValue';
import { getLatentOrder } from '../latent/getLatentOrder';
import { createSettlementContext } from '../settlement/createSettlementContext';
import { finishSettlement } from '../settlement/finishSettlement';
import { assertVirtualWriteShape } from './assertVirtualWriteShape';
import { collectReplacePaths } from './collectReplacePaths';
import { getSettlementScratch } from './getSettlementScratch';
import { isPlain } from './isPlain';
import { markWrite } from './markWrite';
import { markWrongKindAncestors } from './markWrongKindAncestors';
import { pruneLatentRaw } from './pruneLatentRaw';
import { registerRecalculation } from './registerRecalculation';
import { releaseSettlementScratch } from './releaseSettlementScratch';
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
export const writeSchemaNode = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
  input: unknown,
  kind: SchemaNodeWriteKind,
  option: SetValueOption,
  source: SchemaNodeWriteKind = kind,
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
    root.runtime.latentRaw.size === 0 &&
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
    assertSchemaNodeWritable(node);
    if (
      node.behavior.type === 'virtual' &&
      kind !== 'load' &&
      kind !== 'automatic'
    )
      assertVirtualWriteShape(node, input);
  }
  if (!scalarWrite && node.detached) {
    if (hasLivePathKind(node)) return;
    const whole =
      kind !== 'callerPartial' ||
      !isPlain(input) ||
      node.behavior.strategy !== 'branch';
    if (whole) pruneLatentRaw(node.rootNode.runtime, node.path);
    distributeLatentValue(
      node.rootNode.runtime,
      undefined,
      node.path,
      node.blueprintNode,
      input,
      getLatentOrder(node.parent, node.name, node.blueprintNode),
      whole,
      node.parent?.blueprintNode.childEntries ?? [],
    );
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
  try {
    if (context.hasGates)
      getGateRegistry(context.root.runtime).register(context.root);
    if (!scalarWrite && (replaces || kind === 'load')) {
      if (batch) {
        for (let index = 0; index < writeOrigins.length; index++) {
          const origin = writeOrigins[index];
          if (origin.source !== 'automatic')
            pruneLatentRaw(node.runtime, origin.path, origin.keys, context);
        }
      } else pruneLatentRaw(node.runtime, node.path, undefined, context);
    }
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
