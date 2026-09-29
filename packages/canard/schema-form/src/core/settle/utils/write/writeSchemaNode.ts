import type { SchemaNodeRecord } from '../../../record';
import type { SetValueOption } from '../../../types/value';
import { SetValueOption as WriteOption } from '../../../types/value';
import { SchemaFormError } from '../../../../errors';
import type { SchemaNodeWriteKind, SettlementContext } from '../../type';
import { commitSettlement } from '../commit/commitSettlement';
import { computeNode } from '../compute/computeNode';
import { getGateRegistry } from '../gates/getGateRegistry';
import { markWrite } from './markWrite';
import { registerRecalculation } from './registerRecalculation';
import { staticSpec } from './staticSpec';
import { BUDGET_EXCEEDED } from '../errors/settleErrorCode';
import { transitionSettlement } from '../transition/transitionSettlement';
import { restoreSourceB } from '../transition/restoreSourceB';
import { pruneLatentRaw } from './pruneLatentRaw';
import { promoteHostForChildWrite } from './promoteHostForChildWrite';

/**
 * Settle one caller write through marking, calculation, and a single commit.
 * @param node - Live target belonging to a tree with a node factory
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
  if (node.detached) {
    node.rootNode.runtime.latentRaw.set(
      JSON.stringify([node.path, node.blueprintNode.kind]),
      node.behavior.interpret(input, staticSpec(node.schemaType, node.nullable)));
    return;
  }
  const disable = (option & WriteOption.DisableAutomaticWrites) !== 0;
  const enable = (option & WriteOption.EnableAutomaticWrites) !== 0;
  const context: SettlementContext<Self> = {
    root: node.rootNode,
    target: node,
    kind,
    suppressAutomaticWrites: disable || (!enable &&
      node.rootNode.runtime.disableAutomaticWrites === true),
    loadScope: kind === 'load' ? node : undefined,
    entered: new Set(),
    exited: new Set(),
    selectedDeclarationIds: new Map(),
    writtenInputs: new Map(),
    automaticLog: [],
    filledNodes: new Set(),
    inTransition: false,
    latentAutomaticLog: new Map(),
    automatic: false,
    automaticChanged: false,
    dirtyPaths: new Set(),
    shapeDirtyPaths: new Set(),
    changedRaw: new Set(),
    changedNodes: new Set(),
    originalSchemas: new Map(),
  };
  getGateRegistry(context.root.runtime).register(context.root);
  if (kind === 'load')
    for (const path of node.runtime.typeMismatchPaths)
      if (!node.path || path === node.path || path.startsWith(`${node.path}/`))
        node.runtime.typeMismatchPaths.delete(path);
  if (kind === 'callerReplace' || kind === 'load' ||
    (kind === 'callerPartial' && (input === null || typeof input !== 'object' ||
      Array.isArray(input) || node.behavior.strategy !== 'branch')))
    pruneLatentRaw(node);
  markWrite(node, input, context);
  if (kind !== 'load' && kind !== 'automatic')
    promoteHostForChildWrite(node, context);
  registerRecalculation(context);
  computeNode(context.root, context);
  const explicitRaw = new Set(context.changedRaw);
  if (context.hostWheelExceeded && !context.failure) {
    context.failure = new SchemaFormError(BUDGET_EXCEEDED,
      `Host wheel budget exceeded at ${node.path}`, { path: node.path });
    context.cause = 'budget';
    context.exceededBudget = 'hostWheel';
    context.iterations = context.hostWheelExceeded;
  }
  if (!context.failure) transitionSettlement(context);
  if (context.cause === 'budget') restoreSourceB(context, explicitRaw);
  commitSettlement(context);
  if (context.failure) throw context.failure;
};
