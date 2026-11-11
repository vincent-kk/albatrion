import type { FieldNodeRecord } from '../../../record';
import { exitFieldNodeChain } from './exitFieldNodeChain';

/**
 * Close an interrupted entry without replacing the reporter failure that escaped it.
 * @param node - Entry whose cleanup still owes an exit
 * @param failure - Original reporter failure, which must not be reported recursively
 * @returns Never; cleanup completes before the original failure is rethrown
 */
export const exitFailedFieldNodeChain = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  failure: unknown,
): never => {
  try {
    exitFieldNodeChain(node);
  } catch {
    // Cleanup's collected failures do not replace the reporter's own failure.
  }
  throw failure;
};
