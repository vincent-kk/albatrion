import type { BlueprintChildEntry } from '../../../../blueprint';
import { getItemEntries } from '../../../../blueprint';
import type { FieldNodeRecord } from '../../../../record';

/**
 * Find the edge through which a live child was admitted by its parent.
 * Array items read any slot's entries: every slot copies the same item template declarations.
 * @param parent - Live parent whose template owns the edge
 * @param child - Live child whose template and name select the edge
 * @returns The admitting edge
 * @throws When no edge of the parent's template admits this child's template
 */
export const readAdmittingEntry = <Self extends FieldNodeRecord<Self>>(
  parent: Self,
  child: Self,
): BlueprintChildEntry => {
  const template = parent.blueprintNode;
  const entries =
    parent.behavior.type === 'array'
      ? getItemEntries(template, Number(child.name))
      : template.childEntries;
  for (const entry of entries)
    if (
      entry.node === child.blueprintNode &&
      (parent.behavior.type === 'array' || entry.name === child.name)
    )
      return entry;
  throw new Error(`No admitting edge for ${child.path} under ${parent.path}`);
};
