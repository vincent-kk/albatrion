import type { SchemaNodeRecord } from '../../../record';

/**
 * Recognize an absent branch from both of its state channels.
 * @param node - Newly appearing node considered for default filling
 * @returns Whether no explicit raw or extras survive in this subtree
 */
export const isMissingRaw = <Self extends SchemaNodeRecord<Self>>(node: Self): boolean => {
  if (node.raw === undefined) return true;
  if (node.behavior.strategy !== 'branch' || node.raw === null ||
    typeof node.raw !== 'object' || Array.isArray(node.raw) ||
    Object.keys(node.raw).length > 0 || node.extras !== undefined) return false;
  return (node.children ?? []).every((child) => isMissingRaw(child));
};
