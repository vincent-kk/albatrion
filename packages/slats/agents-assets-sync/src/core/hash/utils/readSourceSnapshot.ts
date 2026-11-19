import { open } from 'node:fs/promises';

import type { SourceSnapshot } from '../../types/sourceSnapshot.js';
import { normalizeRuleSource } from '../../utils/normalizeRuleSource.js';
import { hashContent } from '../hash.js';

/** Read bytes and mode from one handle, caching the result for the whole run.
 * @param path Absolute source file.
 * @param cache Run-owned snapshots, including absent files.
 * @returns The checked bytes, mode and hashes, or null when absent.
 * @throws The original IO error for failures other than absence.
 */
export async function readSourceSnapshot(path: string, cache?: Map<string, SourceSnapshot | null>): Promise<SourceSnapshot | null> {
  if (cache?.has(path)) return cache.get(path) ?? null;
  const handle = await open(path, 'r').catch((error: NodeJS.ErrnoException) => {
    if (error.code === 'ENOENT') return null;
    throw error;
  });
  if (!handle) { cache?.set(path, null); return null; }
  try {
    const [bytes, metadata] = await Promise.all([handle.readFile(), handle.stat()]);
    const body = normalizeRuleSource(bytes.toString('latin1'));
    const source = { bytes, mode: metadata.mode, body, bodyHash: hashContent(Buffer.from(body, 'latin1')), rawHash: hashContent(bytes) };
    cache?.set(path, source);
    return source;
  } finally { await handle.close(); }
}
