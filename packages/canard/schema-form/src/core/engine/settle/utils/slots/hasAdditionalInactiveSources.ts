import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { Optional } from '@aileron/declare';

import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import { isMisfit } from '../commit/isMisfit';
import { getRetainedChildEntry } from './getRetainedChildEntry';

/**
 * Tell whether an inactive interval adds rows beyond a reference's frozen host view.
 * @param instance - Source whose active own channels were absent from its frozen list
 * @param overlay - Final exit exclusions without modifying those source channels
 * @returns Whether a new active lifetime must rebuild its aggregate list identity
 */
export const hasAdditionalInactiveSources = <
  Self extends FieldNodeRecord<Self>,
>(
  instance: Self,
  overlay: Optional<InactiveSlotOverlay> = instance.retainedSourceOverlay,
): boolean => {
  const own = overlay && hasOwnProperty(overlay, 'source');
  const source = own ? overlay.source : overlay?.replace ? undefined : instance.source;
  if (instance.behavior.strategy === 'terminal') return source !== undefined;
  if (instance.behavior.type === 'array' && !own && !overlay?.replace)
    return true;
  if (source !== undefined && isMisfit(source, instance.schemaType, instance.nullable))
    return true;
  if (overlay?.replace) return false;
  for (const child of instance.children ?? []) {
    if (child.parent !== instance) continue;
    const binding = getRetainedChildEntry(
      instance,
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
