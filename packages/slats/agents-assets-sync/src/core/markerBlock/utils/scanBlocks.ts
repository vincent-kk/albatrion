import { scanDocument } from './scanDocument/scanDocument.js';
import type { LocatedBlock } from './scanDocument/types.js';

/** Read managed markers outside supported code and HTML comment contexts.
 * @param content Complete document text or a reversible byte view.
 * @returns Managed blocks in document order, including duplicate identifiers.
 */
export function scanBlocks(content: string): LocatedBlock[] {
  return scanDocument(content).blocks;
}
