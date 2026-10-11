import { dispatchFinishInput } from '../../../dispatch';
import type { SchemaNode } from '../../type';
import { requireRuntimeSchemaNode } from '../requireRuntimeSchemaNode';

/**
 * Binding-only; not exported from src/index.ts.
 * Delegate the binding operation through the core entry boundary.
 * @param node - Public occurrence whose behavior finishes input
 * @returns Nothing; the dispatcher completes the operation synchronously
 */
export const finishSchemaNodeInput = (
  node: SchemaNode,
): void =>
  dispatchFinishInput(requireRuntimeSchemaNode(node));

