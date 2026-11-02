import { captureFieldNodeChange } from '../../../../record';
import type { FieldNodeRecord } from '../../../../record';
import type { SettlementContext } from '../../../types/settlement';
import { captureDetachedFieldNodeReads } from '../../detached/captureDetachedFieldNodeReads';

/**
 * Preserve an old occurrence's reads, clear its moved misfit and detach it.
 * @param departing - Owned occurrence visited during final record disposal
 * @param context - Settlement holding previous projections and original schemas
 * @param rekeyed - Owning slot's processed move, when structural rekey occurred
 * @returns Nothing; the occurrence is detached and its last committed reads remain available
 */
export const detachPerishedNode = <Self extends FieldNodeRecord<Self>>(
  departing: Self,
  context: SettlementContext<Self>,
  rekeyed?: { previous: string; current?: string },
): void => {
  if (!departing.runtime.detachedReads?.has(departing))
    captureDetachedFieldNodeReads(departing, {
      emit: context.previousEmit,
      context: context.previousContext,
      schema:
        context.originalSchemas.get(departing.path)?.schema ??
        departing.schema.schema,
    });
  if (rekeyed?.current !== undefined)
    departing.runtime.misfitPaths.delete(
      rekeyed.current + departing.path.slice(rekeyed.previous.length),
    );
  departing.detached = true;
  departing.isActive = captureFieldNodeChange(departing, 'isActive', false);
};
