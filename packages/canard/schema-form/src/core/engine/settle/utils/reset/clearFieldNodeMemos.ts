import type { FieldNodeRecord } from '../../../record';

/**
 * Drop a node's recomputable memo fields at a whole-tree lifetime boundary: a form reset or disposal.
 * @param node - Occurrence reached by that boundary's walk; departed references keep their memos, which every read revalidates
 * @returns Nothing; the next read recomputes each memo from the node's current inputs
 */
export const clearFieldNodeMemos = (
  node: Pick<
    FieldNodeRecord<unknown>,
    | '__objectShape__'
    | '__arrayShape__'
    | '__childEntries__'
    | '__declarationKey__'
    | '__budgetCap__'
  >,
): void => {
  node.__objectShape__ = undefined;
  node.__arrayShape__ = undefined;
  node.__childEntries__ = undefined;
  node.__declarationKey__ = undefined;
  node.__budgetCap__ = undefined;
};
