import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import type { Action } from '../../buildPlan/index.js';
import { removeBlock, upsertBlock } from '../../markerBlock/index.js';

/**
 * Apply every block action for one shared document in a single
 * read-modify-write.
 *
 * The document is other tools' and the user's ground too, so it is rewritten
 * whole exactly once: content outside this package's blocks survives byte for
 * byte, and no concurrent writer can drop a sibling block's change.
 *
 * @param fileAbs - absolute path of the document, created when absent
 * @param actions - block actions whose target is this document
 * @param assetRoot - consumer asset tree the source bodies are read from
 */
export async function applyBlockActions(
  fileAbs: string,
  actions: readonly Action[],
  assetRoot: string,
): Promise<void> {
  let content = await readFile(fileAbs, 'utf-8').then(
    (text) => text,
    (error: NodeJS.ErrnoException) => {
      if (error?.code === 'ENOENT') return '';
      throw error;
    },
  );

  for (const action of actions) {
    if (action.target.kind !== 'block') continue;
    const { blockId } = action.target;
    if (action.kind === 'delete') {
      content = removeBlock(content, blockId);
      continue;
    }
    const body = await readFile(join(assetRoot, action.relPath), 'utf-8');
    content = upsertBlock(content, blockId, body);
  }

  await mkdir(dirname(fileAbs), { recursive: true });
  await writeFile(fileAbs, content, 'utf-8');
}
