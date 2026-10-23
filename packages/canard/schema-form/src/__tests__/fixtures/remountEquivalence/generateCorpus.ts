import { createCorpusScene } from './generateCorpus/utils/createCorpusScene';
import type { RemountScene } from './types';

/**
 * Generate a deterministic grammar corpus with a stable per-family prefix.
 * @param seed - Recorded 32-bit seed; 443 is the committed default.
 * @param count - Multiple of sixteen; verify runners request at least 1024.
 * @returns Independent authored schemas and ordered public write sequences.
 */
export function generateCorpus(seed = 443, count = 128): RemountScene[] {
  if (count < 16 || count % 16) throw new Error('CORPUS_SIZE_MULTIPLE_OF_16');
  const result: RemountScene[] = [];
  for (let family = 0; family < 16; family++) {
    let state = (seed + family * 65537) >>> 0;
    for (let variant = 0; variant < count / 16; variant++) {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      result.push(createCorpusScene(seed, family, variant, state));
    }
  }
  return result;
}
