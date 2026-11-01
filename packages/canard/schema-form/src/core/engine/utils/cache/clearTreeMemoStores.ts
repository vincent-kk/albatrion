import type { TreeMemoStores } from '../../types/treeMemoStores';

/** Drop recomputable stores at a whole-tree lifetime boundary. */
export const clearTreeMemoStores = (runtime: TreeMemoStores): void => {
  runtime.committedDeclarationKeys = undefined;
  runtime.deriveTargetIds = undefined;
  runtime.arrayShapes = undefined;
  runtime.objectShapes = undefined;
  runtime.hostBudgetCaps = undefined;
  runtime.arrayChildEntries = undefined;
};
