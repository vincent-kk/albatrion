import { changeSchemaNodeContext } from '../../settle';
import type { SchemaNode } from '../type';
import { requireRuntimeSchemaNode } from './requireRuntimeSchemaNode';

/**
 * Delegate a binding context change to one synchronous settlement.
 * @param root - Public view of the live tree root
 * @param context - Already merged Form and provider context
 * @returns Nothing; the runtime slot and tree settle together
 */
export const setContext = (root: SchemaNode,
  context: Readonly<Record<string, unknown>>): void =>
  changeSchemaNodeContext(requireRuntimeSchemaNode(root), context);
