import { isArray } from '@winglet/common-utils/filter';

import type { SchemaNodeRuntime } from '../../../record';

/**
 * Mutate one committed baseline and its source and target path indexes together.
 * @param runtime - Tree-owned baseline store and occurrence indexes
 * @param key - Serialized authored rule occurrence with source and optional target
 * @param operation - Set the supplied value or remove the baseline
 * @param value - Consumed expression value, including a valid undefined value
 * @returns Nothing; all three runtime slots stay in sync
 */
export const updateCommittedRuleValue = <Self>(
  runtime: SchemaNodeRuntime<Self>, key: string,
  operation: 'set' | 'delete', value?: unknown,
): void => {
  if (operation === 'delete' && !runtime.committedRuleValues?.has(key)) return;
  const parts: unknown = JSON.parse(key);
  if (!isArray(parts) || typeof parts[0] !== 'string') return;
  const source = parts[0];
  const target = typeof parts[5] === 'string' ? parts[5] : undefined;
  if (operation === 'delete') {
    runtime.committedRuleValues?.delete(key);
    const sourceKeys = runtime.committedRuleKeysBySource?.get(source);
    sourceKeys?.delete(key);
    if (sourceKeys?.size === 0) runtime.committedRuleKeysBySource?.delete(source);
    if (target !== undefined) {
      const targetKeys = runtime.committedRuleKeysByTarget?.get(target);
      targetKeys?.delete(key);
      if (targetKeys?.size === 0) runtime.committedRuleKeysByTarget?.delete(target);
    }
    return;
  }
  (runtime.committedRuleValues ??= new Map()).set(key, value);
  let sourceKeys = runtime.committedRuleKeysBySource?.get(source);
  if (!sourceKeys) {
    sourceKeys = new Set();
    (runtime.committedRuleKeysBySource ??= new Map()).set(source, sourceKeys);
  }
  sourceKeys.add(key);
  if (target === undefined) return;
  let targetKeys = runtime.committedRuleKeysByTarget?.get(target);
  if (!targetKeys) {
    targetKeys = new Set();
    (runtime.committedRuleKeysByTarget ??= new Map()).set(target, targetKeys);
  }
  targetKeys.add(key);
};
