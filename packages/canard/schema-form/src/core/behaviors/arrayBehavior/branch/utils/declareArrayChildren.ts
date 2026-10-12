import { getItemEntry } from '../../../../blueprint';
import type { BlueprintChildEntry, BlueprintNode } from '../../../../blueprint';
import type { Behavior } from '../../../../record';

/** Each template keeps only its most recent count's entry list. */
const LAST = new WeakMap<BlueprintNode, {
  count: number; result: readonly BlueprintChildEntry[];
}>();
/** Shared declaration result when an array has no templated positions. */
const EMPTY: readonly BlueprintChildEntry[] = Object.freeze([]);

/**
 * Return item entries in slot order; a new count costs O(itemCount) and replaces the memo.
 * @param node - Array host with a template and current occupied count
 * @returns Reused frozen entries for templated positions only
 */
export const declareArrayChildren: Behavior['declareChildren'] = (node) => {
  const template = node.blueprintNode;
  const count = node.itemCount;
  const cached = LAST.get(template);
  if (cached?.count === count) return cached.result;
  const entries: BlueprintChildEntry[] = [];
  for (let index = 0; index < count; index++) {
    const entry = getItemEntry(template, index);
    if (entry) entries.push(entry);
  }
  const result = entries.length === 0 ? EMPTY : Object.freeze(entries);
  LAST.set(template, { count, result });
  return result;
};
