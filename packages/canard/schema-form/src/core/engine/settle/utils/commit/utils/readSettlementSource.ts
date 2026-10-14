import { JSONPointer as $ } from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../../record';
import type { FieldNodeWriteKind, SettlementContext } from '../../../type';

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
): FieldNodeWriteKind | undefined => {
  const origins = context.writeOrigins;
  for (let index = (origins?.length ?? 0) - 1; index >= 0; index--) {
    const origin = origins![index];
    if (
      origin.keys &&
      path !== origin.path &&
      !origin.keys.includes(
        path
          .slice(origin.path.length + 1)
          .split($.Separator)[0]
          .replace(/~1/g, $.Separator)
          .replace(/~0/g, '~'),
      )
    )
      continue;
    if (path === origin.path || path.startsWith(`${origin.path}/`))
      return !exact || path === origin.path ? origin.source : undefined;
  }
  return !exact || path === context.target.path
    ? (context.source ?? context.kind)
    : undefined;
};
