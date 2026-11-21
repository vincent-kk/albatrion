import type { Optional } from '@aileron/declare';

import type { FieldNodeRecord } from '../../../../record';
import type { FieldNodeWriteKind } from '../../../../types/value';
import type { SettlementContext } from '../../../types/settlement';
import { readWriteCoverage } from '../../write/readWriteCoverage';

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
  const origin = origins && readWriteCoverage(origins, path, 'latest');
  if (origin)
    return !exact || (path === origin.path && !origin.isIndirect)
      ? origin.source
      : undefined;
  return !exact || path === context.target.path
    ? (context.source ?? context.kind)
    : undefined;
};
