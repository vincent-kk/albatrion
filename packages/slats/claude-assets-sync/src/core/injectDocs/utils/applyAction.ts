import { copyFile, mkdir, unlink } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { logger } from '../../../utils/logger.js';
import type { Action } from '../../buildPlan/index.js';

export async function applyAction(
  action: Action,
  assetRoot: string,
): Promise<void> {
  if (action.kind === 'copy') {
    const srcAbs = join(assetRoot, action.relPath);
    await mkdir(dirname(action.dstAbs), { recursive: true });
    await copyFile(srcAbs, action.dstAbs);
  } else if (action.kind === 'delete')
    await unlink(action.dstAbs).catch((error) => {
      if (error?.code !== 'ENOENT') {
        logger.warn(
          `[claude-assets-sync] unlink failed: ${action.dstAbs} (${error?.code ?? error})`,
        );
      }
    });
}
