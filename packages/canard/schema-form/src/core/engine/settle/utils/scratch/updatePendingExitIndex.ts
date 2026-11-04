import {
  JSONPointer as $,
  resolvePointer,
} from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';

/**
 * Maintain the host and child count layers after an exact pending-key mutation.
 * @param context - Settlement sharing the lazily allocated index with its scratch
 * @param path - Registered child path from the pending key, including escaped segments
 * @param delta - One newly inserted key or one deleted key
 * @returns Nothing; removes empty child and host entries and retains the reusable outer map
 */
export const updatePendingExitIndex = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
  path: string,
  delta: 1 | -1,
): void => {
  let index = context.pendingExitPaths;
  if (!index) {
    if (delta < 0) return;
    index = context.pendingExitPaths = new Map();
    if (context.pendingExitScratch)
      context.pendingExitScratch.pendingExitPaths = index;
  }
  const host = resolvePointer(path, $.Parent);
  let children = index.get(host);
  if (!children) {
    if (delta < 0) return;
    index.set(host, (children = new Map()));
  }
  const count = (children.get(path) ?? 0) + delta;
  if (count > 0) children.set(path, count);
  else children.delete(path);
  if (children.size === 0) index.delete(host);
};
