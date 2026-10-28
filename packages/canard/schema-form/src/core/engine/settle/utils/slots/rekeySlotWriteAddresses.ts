import { appendSegment } from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import { DetachedWriteAddress } from '../detached/DetachedWriteAddress';
import { getSlotOrder } from './getSlotOrder';

/**
 * Move weak write cells while keeping every detached public path unchanged.
 * @param host - Live owner already rebound to its new array position
 * @returns Nothing; affected inactive readers publish their new paths at commit
 */
export const rekeySlotWriteAddresses = <Self extends FieldNodeRecord<Self>>(
  host: Self,
): void => {
  const move = (source: Self, path: string, order: readonly number[]): void => {
    const address = { path, order };
    DetachedWriteAddress.transfer(source, address, source.runtime);
    DetachedWriteAddress.retain(source, address, source.runtime);
    for (const child of source.children ?? []) {
      if (child.parent !== source) continue;
      const childOrder = getSlotOrder(
        child.parent,
        child.name,
        child.blueprintNode,
      );
      move(child, appendSegment(path, child.name), [
        ...order,
        ...childOrder.slice(source.depth),
      ]);
    }
    for (const [entry, child] of source.inactiveSlots ?? []) {
      const childOrder = getSlotOrder(
        child.parent,
        child.name,
        child.blueprintNode,
      );
      move(child, appendSegment(path, entry.name), [
        ...order,
        ...childOrder.slice(source.depth),
      ]);
    }
  };
  for (const [entry, source] of host.inactiveSlots ?? [])
    move(
      source,
      appendSegment(host.path, entry.name),
      getSlotOrder(host, entry.name, entry.node),
    );
  if (
    host.inactiveSlots?.size ||
    host.inactiveSlotOverlays?.size ||
    host.inactiveSlotChildren?.size
  )
    (host.runtime.slotDirtyHosts ??= new Set()).add(host);
};
