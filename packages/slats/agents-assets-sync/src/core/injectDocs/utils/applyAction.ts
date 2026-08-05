import { copyFile, mkdir, unlink } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { logger } from '../../../utils/logger.js';
import type { Action } from '../../buildPlan/index.js';

/**
 * Apply one file-targeted action.
 *
 * Block-targeted actions are not this function's business — they go through
 * `applyBlockActions`, which rewrites a shared document once instead of once
 * per block. Passing one here does nothing rather than failing, so a caller
 * feeding a whole plan to a pool cannot corrupt a document by accident.
 *
 * @param action - a single action, expected to carry a `file` target
 * @param assetRoot - consumer asset tree the source file is read from
 */
export async function applyAction(
  action: Action,
  assetRoot: string,
): Promise<void> {
  if (action.target.kind !== 'file') return;
  const { dstAbs } = action.target;

  if (action.kind === 'copy' || action.kind === 'warn-diverged') {
    await mkdir(dirname(dstAbs), { recursive: true });
    await copyFile(join(assetRoot, action.relPath), dstAbs);
    return;
  }
  if (action.kind === 'delete')
    await unlink(dstAbs).catch((error) => {
      if (error?.code !== 'ENOENT') {
        logger.warn(
          `[agents-assets-sync] unlink failed: ${dstAbs} (${error?.code ?? error})`,
        );
      }
    });
}
