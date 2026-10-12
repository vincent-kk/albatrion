import { isArray } from '@winglet/common-utils/filter';

import type { SchemaNodeRecord } from '../../../record';
import type { SetValueOption } from '../../../types/value';
import type { SchemaNodeWriteKind } from '../../type';
import { computeNode } from '../compute/computeNode';
import { getGateRegistry } from '../gates/getGateRegistry';
import { markWrite } from './markWrite';
import { assertVirtualWriteShape } from './assertVirtualWriteShape';
import { isPlain } from './isPlain';
import { registerRecalculation } from './registerRecalculation';
import { pruneLatentRaw } from './pruneLatentRaw';
import { markWrongKindAncestors } from './markWrongKindAncestors';
import { releaseWrongKindHosts } from './releaseWrongKindHosts';
import { getSettlementScratch } from './getSettlementScratch';
import { releaseSettlementScratch } from './releaseSettlementScratch';
import { getLatentOrder } from '../latent/getLatentOrder';
import { hasLivePathKind } from '../detached/hasLivePathKind';
import { distributeLatentValue } from '../latent/distributeLatentValue';
import { createSettlementContext } from '../settlement/createSettlementContext';
import { finishSettlement } from '../settlement/finishSettlement';

/**
 * Apply a live write or an own-kind detached latent write (26C-14).
 * @param node - Live target or detached reference in a tree with a node factory
 * @param input - Caller-owned value interpreted first under static types
 * @param kind - Input origin retained for warning and transition semantics
 * @param option - Caller flags whose automatic-write bits override the form default
 * @returns Nothing; live records carry the committed shape and values
 * @throws A deferred gate or shared declaration failure after commit
 */
export const writeSchemaNode = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
  input: unknown,
  kind: SchemaNodeWriteKind,
  option: SetValueOption,
): void => {
  if (node.behavior.type === 'virtual' &&
    kind !== 'load' && kind !== 'automatic')
    assertVirtualWriteShape(node, input);
  if (node.detached) {
    if (hasLivePathKind(node)) return;
    const whole = kind !== 'callerPartial' || !isPlain(input) ||
      node.behavior.strategy !== 'branch';
    if (whole) pruneLatentRaw(node.rootNode.runtime, node.path);
    distributeLatentValue(node.rootNode.runtime, undefined, node.path,
      node.blueprintNode, input,
      getLatentOrder(node.parent, node.name, node.blueprintNode),
      whole, node.parent?.blueprintNode.childEntries ?? []);
    return;
  }
  const scratch = getSettlementScratch(node.rootNode.runtime);
  const replaces = kind === 'callerReplace' ||
    kind === 'input' && node.behavior.strategy === 'branch' ||
    (kind === 'callerPartial' && (input === null || typeof input !== 'object' ||
      isArray(input) || node.behavior.strategy !== 'branch'));
  const context = createSettlementContext(node, kind, option, scratch, replaces);
  try {
    if (context.hasGates) getGateRegistry(context.root.runtime).register(context.root);
    if (replaces || kind === 'load')
      pruneLatentRaw(node.runtime, node.path, undefined, context);
    markWrite(node, input, context);
    if (kind !== 'load' && kind !== 'automatic')
      markWrongKindAncestors(node, context);
    registerRecalculation(context);
    computeNode(context.root, context);
    releaseWrongKindHosts(context);
    finishSettlement(context, scratch);
  } finally {
    releaseSettlementScratch(scratch);
  }
};
