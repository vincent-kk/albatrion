import type { RunFailure } from '../../../core/index.js';
import { logger } from '../../../utils/logger.js';

/** Route resolution failure to the run owner or the standalone compatibility exit.
 * @param reason Complete diagnostic naming the rejected target.
 * @param onFailure Run-owned failure collector, when resolving for the dispatcher.
 * @returns Never returns; resolution cannot continue with unknown metadata.
 */
export function rejectTarget(
  reason: string,
  onFailure?: (reason: string) => never,
  diagnostics?: RunFailure[],
  path = reason,
  unitKey = path,
): never {
  diagnostics?.push({ unitKey, path, stage: 'discover', reason });
  if (onFailure) return onFailure(reason);
  logger.error(reason);
  process.exit(2);
}
