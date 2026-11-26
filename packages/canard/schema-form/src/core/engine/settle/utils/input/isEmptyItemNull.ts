import type { FieldNodeRecord } from '../../../record';

/**
 * Decide whether a null received at this occurrence is a deliberately empty array item.
 * The caller has already found the interpreted value to be null; this reads only the position.
 * Such a null is stored as an undefined source without a misfit, while the array still emits
 * its placeholder null there (arrayBehavior VALUE-034). The test uses the static declaration,
 * as the misfit test does, because the write boundary runs before gates narrow the type list.
 * An array parent is always a branch array: only branch templates receive child entries and
 * only branch hosts select children. A template that is not nullable is never of kind null,
 * because the blueprint gives kind null only to a type list holding null alone.
 * @param node - Occurrence that received the null; its parent and template decide the reading
 * @returns Whether the parent is an array and the template is a leaf (kind other than object
 *   and array) that is not nullable by its static declaration
 */
export const isEmptyItemNull = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): boolean => {
  const parent = node.__parent__;
  const template = node.blueprintNode;
  return (
    parent !== null &&
    parent.behavior.type === 'array' &&
    !template.isNullable &&
    template.kind !== 'object' &&
    template.kind !== 'array'
  );
};
