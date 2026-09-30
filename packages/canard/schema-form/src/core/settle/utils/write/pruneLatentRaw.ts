import type { SchemaNodeRecord } from '../../../record';
import { escapeSegment } from '@winglet/json/pointer';

/**
 * Remove every latent source of any kind covered by a whole replacement.
 * @param node - Replacement target whose scope holds the stale latent sources
 * @param names - Optional replaced child names; absent means the whole scope
 * @returns Nothing; the replacement value becomes the only raw of each path
 */
export const pruneLatentRaw = <Self extends SchemaNodeRecord<Self>>(
  node: Self, names?: readonly string[],
): void => {
  const childPaths = names?.map((name) => `${node.path}/${escapeSegment(name)}`);
  for (const key of node.runtime.latentRaw.keys()) {
    const identity: unknown = JSON.parse(key);
    if (!Array.isArray(identity) || typeof identity[0] !== 'string') continue;
    if (childPaths ? childPaths.some((path) => identity[0] === path ||
      identity[0].startsWith(`${path}/`)) :
      !node.path || identity[0] === node.path ||
      identity[0].startsWith(`${node.path}/`)) {
      node.runtime.latentRaw.delete(key);
      node.runtime.latentRawMetadata?.delete(key);
      node.runtime.latentRawDirty = true;
    }
  }
};
