import { adoptSchemaNodeChain } from '../../../dispatch';
import type { SchemaNode } from '../../type';
import { requireRuntimeSchemaNode } from '../requireRuntimeSchemaNode';

/**
 * Binding-only; not exported from src/index.ts.
 * Delegate the binding operation through the core entry boundary.
 * @param previousRoot - Root whose committed tree is retired
 * @param nextRoot - Replacement receiving the open chain and path-keyed errors
 * @returns Nothing; the dispatcher completes the operation synchronously
 */
export const adoptSchemaNodeTree = (
  previousRoot: SchemaNode, nextRoot: SchemaNode,
): void =>
  adoptSchemaNodeChain(requireRuntimeSchemaNode(previousRoot, true), requireRuntimeSchemaNode(nextRoot, true));

