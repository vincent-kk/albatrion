import { readFile } from 'node:fs/promises';

import { hashContent } from '../../hash/index.js';
import { normalizeRuleSource } from '../../utils/normalizeRuleSource.js';
import type { RuleSource } from '../type.js';

/** Snapshot and normalize a rule exactly once for every selected agent.
 * @param path Absolute source file.
 * @param cache Run-owned snapshots, including missing files.
 * @returns Normalized bytes and raw hash, or null for an absent source.
 * @throws The original IO error unless the file is absent.
 */
export async function readRuleSource(
  path: string,
  cache?: Map<string, RuleSource | null>,
): Promise<RuleSource | null> {
  if (cache?.has(path)) return cache.get(path) ?? null;
  const bytes = await readFile(path).catch((error: NodeJS.ErrnoException) => {
    if (error.code === 'ENOENT') return null;
    throw error;
  });
  const source =
    bytes === null
      ? null
      : {
          body: normalizeRuleSource(bytes.toString('latin1')),
          rawHash: hashContent(bytes),
        };
  cache?.set(path, source);
  return source;
}
