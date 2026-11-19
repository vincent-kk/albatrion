import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { Action } from '../../buildPlan/index.js';
import { removeBlock, upsertBlock } from '../../markerBlock/index.js';
import { replaceDocument } from './replaceDocument.js';

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
  let content = await readFile(fileAbs, 'latin1').then(
    (text) => text,
    (error: NodeJS.ErrnoException) => {
      if (error?.code === 'ENOENT') return '';
      throw error;
    },
  );

  for (const action of actions) {
    if (action.target.kind !== 'block') continue;
    // Latin-1 is a reversible byte view, including invalid UTF-8 in user prose.
    const blockId = Buffer.from(action.target.blockId, 'utf8').toString(
      'latin1',
    );
    if (action.kind === 'delete') {
      content = removeBlock(content, blockId);
      continue;
    }
    const body = await readFile(join(assetRoot, action.relPath), 'latin1');
    content = upsertBlock(content, blockId, body, {
      document: fileAbs,
      source: join(assetRoot, action.relPath),
    });
  }

  await replaceDocument(fileAbs, Buffer.from(content, 'latin1'));
}
