import type { TreeMemoStores } from '../../types/treeMemoStores';

/** Drop recomputable stores at a whole-tree lifetime boundary. */
export const clearTreeMemoStores = (runtime: TreeMemoStores): void => {
  runtime.deriveTargetIds = undefined;
};
