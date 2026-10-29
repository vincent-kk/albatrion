import type { Optional } from '@aileron/declare';

import {
  getChildPointer,
  isDescendantPath,
  readPointerSegment,
} from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../../record';
import type { FieldNodeWriteKind } from '../../../../types/value';
import type { SettlementContext } from '../../../types/settlement';

/**
 * Resolve the last marked write covering a committed path.
 * @param context - Settlement origin and optional call-ordered batch writes
 * @param path - Changed occurrence's canonical path
 * @param exact - Only return a source when the final covering write targets this path
 * @returns The effective origin, or undefined for an indirect Refresh target
 */
export const readSettlementSource = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  path: string,
  exact = false,
): Optional<FieldNodeWriteKind> => {
  const origins = context.writeOrigins;
  for (let index = (origins?.length ?? 0) - 1; index >= 0; index--) {
    const origin = origins![index];
    if (origin.keys && path !== origin.path) {
      const child = getChildPointer(path, origin.path);
      const name =
        child === undefined ? undefined : readPointerSegment(child, -1);
      if (typeof name !== 'string' || origin.keys.indexOf(name) === -1)
        continue;
    }
    if (path === origin.path || isDescendantPath(path, origin.path))
      return !exact || path === origin.path ? origin.source : undefined;
  }
  return !exact || path === context.target.path
    ? (context.source ?? context.kind)
    : undefined;
};
