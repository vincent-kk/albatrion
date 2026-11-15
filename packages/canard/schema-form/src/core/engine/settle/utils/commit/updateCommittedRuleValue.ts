import { isArray } from '@winglet/common-utils/filter';

import type { FieldNodeRuntime } from '../../../record';
import { PathKeyedMap } from '../../../utils/pathIndex/PathKeyedMap';

/** Annotates the lazily created `committedRuleKeysBySource`; an argument-less `new Map()` would be `Map<any, any>`. */
type CommittedRuleKeysBySource = Map<string, Set<string>>;
/** Annotates the lazily created `committedRuleKeysByTarget`; an argument-less `new Map()` would be `Map<any, any>`. */
type CommittedRuleKeysByTarget = Map<string, Set<string>>;

/**
 * Mutate one committed baseline and its source and target path indexes together.
 * @param runtime - Tree-owned baseline store and occurrence indexes
 * @param key - Serialized authored rule occurrence with source and optional target
 * @param operation - Set the supplied value or remove the baseline
 * @param value - Consumed expression value, including a valid undefined value
 * @returns Nothing; all three runtime slots stay in sync
 */
export const updateCommittedRuleValue = <Self>(
  runtime: FieldNodeRuntime<Self>,
  key: string,
  operation: 'set' | 'delete',
  value?: unknown,
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
    if (sourceKeys?.size === 0)
      runtime.committedRuleKeysBySource?.delete(source);
    if (target !== undefined) {
      const targetKeys = runtime.committedRuleKeysByTarget?.get(target);
      targetKeys?.delete(key);
      if (targetKeys?.size === 0)
        runtime.committedRuleKeysByTarget?.delete(target);
    }
    return;
  }
  (runtime.committedRuleValues ??= new PathKeyedMap('rule')).set(key, value);
  let sourceKeys = runtime.committedRuleKeysBySource?.get(source);
  if (!sourceKeys) {
    sourceKeys = new Set();
    const bySource: CommittedRuleKeysBySource =
      (runtime.committedRuleKeysBySource ??= new Map());
    bySource.set(source, sourceKeys);
  }
  sourceKeys.add(key);
  if (target === undefined) return;
  let targetKeys = runtime.committedRuleKeysByTarget?.get(target);
  if (!targetKeys) {
    targetKeys = new Set();
    const byTarget: CommittedRuleKeysByTarget =
      (runtime.committedRuleKeysByTarget ??= new Map());
    byTarget.set(target, targetKeys);
  }
  targetKeys.add(key);
};
