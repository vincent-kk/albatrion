import { isArray } from '@winglet/common-utils/filter';
import type { SchemaNodeRuntime } from '../../../../record';
import { updateCommittedRuleValue } from '../../commit/updateCommittedRuleValue';
import { getRuntimePathStores } from '../../pathIndex/getRuntimePathStores';
import type { ArrayPathMove } from '../type';

/**
 * Move rules whose source or target occurs in an affected item subtree.
 * @param runtime - Baselines and exact source/target occurrence indexes
 * @param moves - Changed positions, including perished roots
 * @param mapPath - Translate either endpoint without changing authored identity
 * @returns Nothing; deletion precedes insertion to preserve chained shifts
 */
export const rekeyCommittedRules = <Self>(
  runtime: SchemaNodeRuntime<Self>, moves: readonly ArrayPathMove[],
  mapPath: (path: string) => string | undefined,
): void => {
  const { rules } = getRuntimePathStores(runtime);
  const keys = new Set<string>();
  for (const move of moves)
    for (const key of rules.pathIndex.under(move.previous)) keys.add(key);
  if (!keys.size) return;
  rules.pathIndex.beginBatch();
  try {
    const inserts: [string, unknown][] = [];
    for (const key of keys) {
      const parts: unknown = JSON.parse(key);
      if (!isArray(parts) || typeof parts[0] !== 'string') continue;
      const value = rules.get(key);
      updateCommittedRuleValue(runtime, key, 'delete');
      const source = mapPath(parts[0]);
      const target = typeof parts[5] === 'string' ? mapPath(parts[5]) : undefined;
      if (source === undefined || typeof parts[5] === 'string' && target === undefined) continue;
      parts[0] = source;
      if (target !== undefined) parts[5] = target;
      inserts.push([JSON.stringify(parts), value]);
    }
    for (const [key, value] of inserts) updateCommittedRuleValue(runtime, key, 'set', value);
  } finally { rules.pathIndex.endBatch(); }
};
