import { isArray } from '@winglet/common-utils/filter';
import type { SchemaNodeRecord } from '../../../record';
import { getLoadValue } from './getLoadValue';
import { setLoadValue } from './setLoadValue';

/**
 * Align one array snapshot after its final shape is known.
 * @param host - Array whose settled itemCount determines the slot count
 * @returns Nothing; existing slots keep their own snapshot values
 */
export const alignArraySnapshotSlots = <Self extends SchemaNodeRecord<Self>>(
  host: Self,
): void => {
  const runtime = host.runtime;
  const previous = getLoadValue(runtime.loadSnapshot, host.path);
  if (!isArray(previous) && host.itemCount === 0) return;
  const slots = isArray(previous) ? previous.slice(0, host.itemCount) : [];
  while (slots.length < host.itemCount) slots.push(undefined);
  runtime.loadSnapshot = setLoadValue(runtime.loadSnapshot, host.path, slots);
};
