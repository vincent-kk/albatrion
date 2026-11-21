import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import { FieldNodeWriteKind } from '../../../types/value';
import type { SettlementContext } from '../../types/settlement';

/**
 * Collect the whole-replacement scopes of a multi-write batch (191C-01, 26C-10).
 * A caller write contributes its own path; partial scopes contribute their explicit keys.
 * Deep merges carry partial branch scopes and replacement leaves; automatic writes never replace outside
 * a batch either.
 * @param writeOrigins - Call-ordered batch origins as flushBatchWrites recorded them
 * @returns Paths whose subtrees the batch replaces, in origin order, possibly repeated
 */
export const collectReplacementPaths = <Self extends FieldNodeRecord<Self>>(
  writeOrigins: NonNullable<SettlementContext<Self>['writeOrigins']>,
): string[] => {
  const paths: string[] = [];
  for (let index = 0; index < writeOrigins.length; index++) {
    const origin = writeOrigins[index];
    if (origin.source === FieldNodeWriteKind.Automatic) continue;
    if (origin.keys)
      for (let key = 0; key < origin.keys.length; key++)
        paths.push(appendSegment(origin.path, origin.keys[key]));
    else paths.push(origin.path);
    if (origin.fields) paths.push(...origin.fields);
  }
  return paths;
};
