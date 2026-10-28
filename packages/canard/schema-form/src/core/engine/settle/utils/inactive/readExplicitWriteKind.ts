import {
  getChildPointer,
  isDescendantPath,
  readPointerSegment,
} from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import type { FieldNodeWriteKind } from '../../../types/value';
import type { SettlementContext } from '../../types/settlement';

/**
 * Read the last caller origin covering one explicit input position.
 * @param context - Call-ordered batch origins or a single caller write
 * @param inputPath - Canonical address of this JSON position
 * @returns Coverage at this position: callerPartial covers only supplied keys, callerReplace covers omitted descendants, automatic never counts, and undefined lies outside every caller origin
 */
export const readExplicitWriteKind = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  inputPath: string,
): FieldNodeWriteKind | undefined => {
  const origins = context.writeOrigins;
  if (!origins) return context.kind;
  // Batch replacement paths retain earlier whole writes after later merges.
  if (
    context.replacePaths?.some(
      (path) => inputPath === path || isDescendantPath(inputPath, path),
    )
  )
    return 'callerReplace';
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
      if (typeof name !== 'string' || !origin.keys.includes(name)) continue;
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
