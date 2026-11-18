import type { FieldNodeRecord } from '../../../../record';
import { FieldNodeWriteKind } from '../../../../types/value';
import type { SettlementContext } from '../../../types/settlement';

/**
 * Prepare input provenance once for a non-load commit, without allocating for caller-only writes.
 * @param context - Settled write with final batch origins and synchronous relay records.
 * @param hasRelay - Whether the runtime currently holds a synchronous relay.
 * @returns Input path and batch/relay flags, or undefined when no input contributed.
 */
export const getInputCommitTracking = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  hasRelay: boolean,
) => {
  const origins = context.writeOrigins;
  const hasInputBatch =
    origins !== undefined &&
    origins.length > 1 &&
    origins.some((origin) => origin.source === FieldNodeWriteKind.Input);
  const inputPath =
    origins?.length === 1
      ? origins[0].source === FieldNodeWriteKind.Input
        ? origins[0].path
        : undefined
      : !origins?.length &&
          (context.source ?? context.kind) === FieldNodeWriteKind.Input
        ? context.target.path
        : undefined;
  return inputPath !== undefined || hasInputBatch || hasRelay
    ? { inputPath, hasInputBatch, hasRelay }
    : undefined;
};
