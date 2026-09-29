import type { SchemaNodeRecord } from '../../../record';
import type { SetValueOption } from '../../../types/value';
import type { SchemaNodeWriteKind, SettlementContext } from '../../type';
import { commitSettlement } from '../commit/commitSettlement';
import { computeNode } from '../compute/computeNode';
import { getGateRegistry } from '../gates/getGateRegistry';
import { markWrite } from './markWrite';
import { registerRecalculation } from './registerRecalculation';

/**
 * Settle one caller write through marking, calculation, and a single commit.
 * @param node - Live target belonging to a tree with a node factory
 * @param input - Caller-owned value interpreted first under static types
 * @param kind - Input origin retained for warning and transition semantics
 * @param _option - Public write flags reserved for the following transition unit
 * @returns Nothing; live records carry the committed shape and values
 * @throws A deferred gate or shared declaration failure after commit
 */
export const writeSchemaNode = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
  input: unknown,
  kind: SchemaNodeWriteKind,
  _option: SetValueOption,
): void => {
  const context: SettlementContext<Self> = {
    root: node.rootNode,
    target: node,
    kind,
    dirtyPaths: new Set(),
    shapeDirtyPaths: new Set(),
    changedRaw: new Set(),
    changedNodes: new Set(),
    originalSchemas: new Map(),
  };
  getGateRegistry(context.root.runtime).register(context.root);
  markWrite(node, input, context);
  registerRecalculation(context);
  computeNode(context.root, context);
  commitSettlement(context);
  if (context.failure) throw context.failure;
};
