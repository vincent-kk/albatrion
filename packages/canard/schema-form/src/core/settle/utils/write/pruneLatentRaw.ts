import type { SchemaNodeRecord } from '../../../record';
import { escapeSegment } from '@winglet/json/pointer';

/**
 * Remove latent sources omitted by a whole replacement within one scope.
 * @param node - Replacement target whose prior inactive paths are stale
 * @param names - Optional replaced child names; absent means the whole scope
 * @returns Nothing; future inactive declarations read only the new input
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
    }
  }
};
