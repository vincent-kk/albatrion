import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Optional } from '@aileron/declare';

import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import { isMisfit } from '../commit/isMisfit';
import { getRetainedChildEntry } from './getRetainedChildEntry';

/**
 * Tell whether an inactive interval adds rows beyond a reference's frozen host view.
 * @param source - Source whose active own channels were absent from its frozen list
 * @param overlay - Final exit exclusions without modifying those source channels
 * @returns Whether a new active lifetime must rebuild its aggregate list identity
 */
export const hasAdditionalInactiveSources = <
  Self extends FieldNodeRecord<Self>,
>(
  source: Self,
  overlay: Optional<InactiveSlotOverlay> = source.retainedSourceOverlay,
): boolean => {
  const own = overlay && hasOwnProperty(overlay, 'raw');
  const raw = own ? overlay.raw : overlay?.replace ? undefined : source.raw;
  if (source.behavior.strategy === 'terminal') return raw !== undefined;
  if (source.behavior.type === 'array' && !own && !overlay?.replace)
    return true;
  if (raw !== undefined && isMisfit(raw, source.schemaType, source.nullable))
    return true;
  if (overlay?.replace) return false;
  for (const child of source.children ?? []) {
    if (child.parent !== source) continue;
    const binding = getRetainedChildEntry(
      source,
      child.name,
      child.blueprintNode,
    );
    if (
      hasAdditionalInactiveSources(
        child,
        binding ? overlay?.children?.get(binding) : undefined,
      )
    )
      return true;
  }
  return false;
};
