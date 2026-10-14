import type { FieldNodeRecord } from '../../../record';
import { changeFieldNodeContext } from '../../../settle';
import { captureChainError } from '../chain/captureChainError';
import { enterFieldNodeChain } from '../chain/enterFieldNodeChain';
import { exitFieldNodeChain } from '../chain/exitFieldNodeChain';

/**
 * Settle a merged binding context through the root entry boundary.
 * @param root - Live form root
 * @param context - Already merged provider and Form context
 * @returns Nothing; any changed emit is delivered before returning
 */
export const dispatchContextChange = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  context: Readonly<Record<string, unknown>>,
): void => {
  if (!enterFieldNodeChain(root)) return;
  try {
    changeFieldNodeContext(root, context);
  } catch (error) {
    captureChainError(root.runtime, error);
  } finally {
    exitFieldNodeChain(root);
  }
};
