import type { Optional } from '@aileron/declare';

import {
  getChildPointer,
  isDescendantPath,
  readPointerSegment,
} from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import type { FieldNodeWriteKind } from '../../../types/value';
import type { SettlementContext } from '../../types/settlement';

/**
 * Read caller coverage at one explicit input position: a whole batch scope first, then the last covering origin.
 * @param context - Batch replace paths and call-ordered origins, or a single caller write
 * @param inputPath - Canonical address of this JSON position
 * @returns Coverage at this position: callerPartial covers only supplied keys, callerReplace covers omitted descendants, automatic never counts, and undefined lies outside every caller origin
 */

export const readExplicitWriteKind = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  inputPath: string,
): Optional<FieldNodeWriteKind> => {
  const origins = context.writeOrigins;
  if (!origins) return context.kind;
  // Batch replacement paths retain earlier whole writes after later merges.
  let hasMatch: Optional<boolean> = undefined;
  {
    const items = context.replacePaths;
    if (items != null) {
      hasMatch = false;
      for (let index = 0, count = items.length; index < count; index++) {
        const path = items[index];

        if (inputPath === path || isDescendantPath(inputPath, path)) {
          hasMatch = true;
          break;
        }
      }
    }
  }
  if (hasMatch) {
    return 'callerReplace';
  }
  for (let index = origins.length - 1; index >= 0; index--) {
    const origin = origins[index];
    const path =
      origin.fields?.find(
        (field) => inputPath === field || isDescendantPath(inputPath, field),
      ) ?? origin.path;
    if (inputPath !== path && !isDescendantPath(inputPath, path)) continue;
    if (origin.keys && inputPath !== path) {
      const child = getChildPointer(inputPath, path);
      const name =
        child === undefined ? undefined : readPointerSegment(child, -1);
      if (typeof name !== 'string' || origin.keys.indexOf(name) === -1)
        continue;
    }
    if (origin.source === 'automatic') return 'automatic';
    if (!origin.keys) return 'callerReplace';
    // A single-write merge is deep; a batched merge replaces each received key whole.
    return origins.length === 1 || inputPath === path
      ? 'callerPartial'
      : 'callerReplace';
  }
  return undefined;
};
