import type { Optional } from '@aileron/declare';

import type { FieldNodeRecord } from '../../../record';
import { FieldNodeWriteKind } from '../../../types/value';
import type { SettlementContext } from '../../types/settlement';
import { readWriteCoverage } from '../write/readWriteCoverage';

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
  if (readWriteCoverage(origins, inputPath, 'whole'))
    return FieldNodeWriteKind.CallerReplace;
  const origin = readWriteCoverage(origins, inputPath, 'latest');
  if (!origin) return undefined;
  if (origin.source === FieldNodeWriteKind.Automatic) return origin.source;
  return origin.partial
    ? FieldNodeWriteKind.CallerPartial
    : FieldNodeWriteKind.CallerReplace;
};
