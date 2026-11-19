import { lstat, unlink } from 'node:fs/promises';
import { join } from 'node:path';

import { readSourceSnapshot } from '../../hash/index.js';
import type { SourceSnapshot } from '../../types/sourceSnapshot.js';
import type { Action } from '../../buildPlan/index.js';
import { replaceDocument } from './replaceDocument.js';

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
 * @param snapshot - plan-time bytes and mode; omitted only by the standalone adapter
 */
export async function applyAction(
  action: Action,
  assetRoot: string,
  snapshot?: SourceSnapshot,
): Promise<void> {
  if (action.target.kind !== 'file') return;
  const { dstAbs } = action.target;

  if (action.kind === 'copy' || action.kind === 'warn-diverged') {
    const source = join(assetRoot, action.relPath);
    const checked = snapshot ?? await readSourceSnapshot(source);
    if (!checked) throw new Error(`Source file missing: ${source}`);
    await replaceDocument(dstAbs, checked.bytes, checked.mode);
    return;
  }
  if (action.kind === 'delete') {
    const entry = await lstat(dstAbs).catch((error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') return undefined;
      throw error;
    });
    if (entry && !entry.isSymbolicLink() && (entry.mode & 0o222) === 0)
      throw new Error(`File is read-only: ${dstAbs}`);
    await unlink(dstAbs).catch((error) => {
      if (error?.code !== 'ENOENT') throw error;
    });
  }
}
