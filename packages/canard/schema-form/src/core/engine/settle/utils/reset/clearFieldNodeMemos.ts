import type { FieldNodeRecord } from '../../../record';

/**
 * Drop a node's recomputable memo fields and its derive target identity at a whole-tree lifetime boundary: a form reset or disposal.
 * @param node - Occurrence reached by that boundary's walk; a departed reference keeps these fields, but every memo read revalidates its inputs and no rule evaluates a detached target
 * @returns Nothing; the next read recomputes each memo from the node's current inputs, and the next rule key issues a new identity
 */
export const clearFieldNodeMemos = (
  node: Pick<
    FieldNodeRecord<unknown>,
    | '__objectShape__'
    | '__arrayShape__'
    | '__childEntries__'
    | '__declarationKey__'
    | '__budgetCap__'
    | '__deriveTargetId__'
  >,
): void => {
  node.__objectShape__ = undefined;
  node.__arrayShape__ = undefined;
  node.__childEntries__ = undefined;
  node.__declarationKey__ = undefined;
  node.__budgetCap__ = undefined;
  node.__deriveTargetId__ = undefined;
};
