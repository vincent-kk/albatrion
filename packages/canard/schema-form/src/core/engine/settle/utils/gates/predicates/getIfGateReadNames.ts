import { EMPTY_ARRAY } from '@winglet/common-utils/constant';

import type { Nullable, Optional } from '@aileron/declare';

import { getBlueprintDerived } from '../../../../utils/cache/derivedRecords';
import { collectIfGateReadNames } from './collectIfGateReadNames';

/**
 * Cache a finite property-read proof without executing or decompiling a guard.
 * @param condition - Authored immutable JSON Schema condition
 * @param blueprint - Optional immutable analysis owning reusable static evidence
 * @returns Unique top-level names, or undefined for a whole-host read
 */
export const getIfGateReadNames = (
  condition: unknown,
  blueprint?: object,
): Optional<readonly string[]> => {
  if (typeof condition === 'boolean') return EMPTY_ARRAY;
  if (!condition || typeof condition !== 'object') return undefined;
  const record = blueprint
    ? getBlueprintDerived<
        'ifGateReadNames',
        Map<object, Nullable<readonly string[]>>
      >(blueprint)
    : undefined;
  const memo = record ? (record.ifGateReadNames ??= new Map()) : undefined;
  const cached = memo?.get(condition);
  if (cached !== undefined) return cached ?? undefined;
  const names: string[] = [];
  const result = collectIfGateReadNames(condition, names, false)
    ? names
    : undefined;
  memo?.set(condition, result ?? null);
  return result;
};
