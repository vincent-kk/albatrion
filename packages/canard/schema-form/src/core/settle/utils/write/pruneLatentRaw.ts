import type { SchemaNodeRecord } from '../../../record';

/**
 * Remove latent sources omitted by a whole replacement within one scope.
 * @param node - Replacement target whose prior inactive paths are stale
 * @returns Nothing; future inactive declarations read only the new input
 */
export const pruneLatentRaw = <Self extends SchemaNodeRecord<Self>>(node: Self): void => {
  for (const key of node.runtime.latentRaw.keys()) {
    const identity: unknown = JSON.parse(key);
    if (!Array.isArray(identity) || typeof identity[0] !== 'string') continue;
    if (!node.path || identity[0] === node.path ||
      identity[0].startsWith(`${node.path}/`)) node.runtime.latentRaw.delete(key);
  }
};
