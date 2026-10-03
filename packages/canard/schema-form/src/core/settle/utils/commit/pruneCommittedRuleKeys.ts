import { isArray } from '@winglet/common-utils/filter';

import type { SchemaNodeRuntime } from '../../../record';
import { updateCommittedRuleValue } from './updateCommittedRuleValue';

/**
 * Remove baselines addressed by one visited or exited path without a global scan.
 * @param runtime - Tree-owned source and target occurrence indexes
 * @param path - Exact live or departed occurrence path
 * @param scope - Source declarations, all occurrence keys, or exit policies
 * @returns Nothing; removed keys leave both indexes and the baseline store
 */
export const pruneCommittedRuleKeys = <Self>(
  runtime: SchemaNodeRuntime<Self>, path: string,
  scope: 'source' | 'occurrence' | 'exitPolicy',
): void => {
  for (const key of runtime.committedRuleKeysBySource?.get(path) ?? []) {
    if (scope === 'exitPolicy') {
      const parts: unknown = JSON.parse(key);
      if (!isArray(parts) || typeof parts[3] !== 'string' ||
        !parts[3].endsWith('/unsetOnInactive')) continue;
    }
    updateCommittedRuleValue(runtime, key, 'delete');
  }
  if (scope !== 'occurrence') return;
  for (const key of runtime.committedRuleKeysByTarget?.get(path) ?? [])
    updateCommittedRuleValue(runtime, key, 'delete');
};
