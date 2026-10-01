import type { SchemaNodeRecord } from '../../../record';
import { changeSchemaNodeContext } from '../../../settle';
import { enterSchemaNodeChain } from '../chain/enterSchemaNodeChain';
import { captureChainError } from '../chain/captureChainError';
import { exitSchemaNodeChain } from '../chain/exitSchemaNodeChain';

/**
 * Settle a merged binding context through the root entry boundary.
 * @param root - Live form root
 * @param context - Already merged provider and Form context
 * @returns Nothing; any changed emit is delivered before returning
 */
export const dispatchContextChange = <Self extends SchemaNodeRecord<Self>>(
  root: Self, context: Readonly<Record<string, unknown>>,
): void => {
  if (!enterSchemaNodeChain(root)) return;
  try { changeSchemaNodeContext(root, context); }
  catch (error) { captureChainError(root.runtime, error); }
  finally { exitSchemaNodeChain(root); }
};
