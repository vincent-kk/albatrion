import type { Optional } from '@aileron/declare';

import { getItemEntries } from '../../../blueprint';
import type { BlueprintChildEntry, BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import { getSlotChildIndex } from './getSlotChildIndex';

/**
 * Resolve the canonical binding of an owned retained child.
 * @param host - New parent whose blueprint owns the binding
 * @param name - Child's unescaped local name
 * @param template - Exact candidate template, including same-name other kinds
 * @returns The binding at this host, or undefined for a non-owned virtual reference
 */
export const getRetainedChildEntry = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  name: string,
  template: BlueprintNode,
): Optional<BlueprintChildEntry> => {
  for (const binding of host.inactiveSlots?.keys() ?? [])
    if (binding.name === name && binding.node === template) return binding;
  for (const binding of host.inactiveSlotOverlays?.keys() ?? [])
    if (binding.name === name && binding.node === template) return binding;
  if (host.behavior.type === 'array')
    return getItemEntries(host.blueprintNode, Number(name)).find(
      (entry) => entry.node === template,
    );
  const index = getSlotChildIndex(host.blueprintNode, name, template);
  return index >= 0 ? host.blueprintNode.childEntries[index] : undefined;
};
