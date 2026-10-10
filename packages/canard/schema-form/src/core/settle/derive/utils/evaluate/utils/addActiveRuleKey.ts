import type { SchemaNodeRecord } from '../../../../../record';
import type { DeriveState } from '../../../type';

/**
 * Index a live rule key under the source occurrence that owns it.
 * @param state - Call-local active rule indexes to update together
 * @param sourcePath - Exact path of the rule's live source occurrence
 * @param key - Stable rule key to retain for commit
 * @returns Nothing; both active indexes contain the key
 */
export const addActiveRuleKey = <Self extends SchemaNodeRecord<Self>>(
  state: DeriveState<Self>, sourcePath: string, key: string,
): void => {
  state.activeRuleKeys.add(key);
  let sourceKeys = state.activeRuleKeysBySource.get(sourcePath);
  if (!sourceKeys) {
    sourceKeys = new Set();
    state.activeRuleKeysBySource.set(sourcePath, sourceKeys);
  }
  sourceKeys.add(key);
};
