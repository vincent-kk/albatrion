import { getItemEntries } from '../../../blueprint';
import type { BlueprintChildEntry, BlueprintNode } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import { getBlueprintNodeIdentity } from '../../../utils/nodeIdentity/getBlueprintNodeIdentity';
import { getSlotEntries } from './getSlotEntries';

/**
 * Find a declared or moved foreign binding without losing an old reference's kind.
 * @param template - Blueprint currently owning this address
 * @param source - Live or immutable retained parent at this depth
 * @param overlay - Replacement sources over that parent
 * @param name - Unescaped occurrence name to resolve
 * @param selected - Old reference's kind, absent for the ordinary first-candidate rule
 * @returns Matching current binding or retained foreign declaration
 */
export const getSlotPathEntry = <Self extends FieldNodeRecord<Self>>(
  template: BlueprintNode,
  source: Self | undefined,
  overlay: InactiveSlotOverlay | undefined,
  name: string,
  selected?: BlueprintNode,
): BlueprintChildEntry | undefined => {
  const declared =
    template.kind === 'array'
      ? getItemEntries(template, Number(name))
      : template.childEntries.filter((entry) => entry.name === name);
  if (!selected)
    return (
      declared[0] ??
      getSlotEntries(source, overlay, template).find(
        (entry) => entry.name === name,
      )
    );
  const exact = declared.find(
    (entry) => entry.name === name && entry.node === selected,
  );
  if (exact) return exact;
  const retained = getSlotEntries(source, overlay, template).filter(
    (entry) => entry.name === name,
  );
  return (
    retained.find((entry) => entry.node === selected) ??
    declared.find(
      (entry) =>
        getBlueprintNodeIdentity(entry.node) ===
        getBlueprintNodeIdentity(selected),
    ) ??
    retained.find(
      (entry) =>
        getBlueprintNodeIdentity(entry.node) ===
        getBlueprintNodeIdentity(selected),
    )
  );
};
