import { EMPTY_ARRAY } from '@winglet/common-utils/constant';

import { getItemEntries } from '../../../../blueprint';
import type { BlueprintChildEntry } from '../../../../blueprint';
import type { Behavior } from '../../../../record';

/**
 * Return item entries in slot order; a new count costs O(itemCount) and replaces the memo.
 * @param node - Array host with a template and current occupied count
 * @returns Reused frozen entries for templated positions only
 */
export const declareArrayChildren: Behavior['declareChildren'] = (node) => {
  const template = node.blueprintNode;
  if (
    template.item === undefined &&
    template.prefixItems === undefined &&
    template.itemCandidates === undefined &&
    template.prefixItemCandidates === undefined
  )
    return EMPTY_ARRAY;
  const count = node.itemCount;
  const cached = node.runtime.arrayChildEntries?.get(node);
  if (cached?.count === count) return cached.result;
  const entries: BlueprintChildEntry[] = [];
  for (let index = 0; index < count; index++) {
    const candidates = getItemEntries(template, index);
    for (const entry of candidates) entries.push(entry);
  }
  const result = entries.length === 0 ? EMPTY_ARRAY : Object.freeze(entries);
  (node.runtime.arrayChildEntries ??= new WeakMap()).set(node, {
    count,
    result,
  });
  return result;
};
