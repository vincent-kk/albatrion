import { maxLite } from '@winglet/common-utils/math';

import type { Nullable, Optional } from '@aileron/declare';

/**
 * Build the array that results from writing one empty slot.
 * @param current - Raw array value; `null` or `undefined` count as empty.
 * @param index - Slot position; positions between the current length and it become explicit `undefined` slots.
 * @param value - Value for that position, already converted by the slot control.
 * @returns A new array; existing items keep their positions and references.
 */
export const fillArraySlot = (
  current: Optional<Nullable<readonly unknown[]>>,
  index: number,
  value: unknown,
): unknown[] =>
  Array.from(
    { length: maxLite(current?.length ?? 0, index + 1) },
    (_, position) => (position === index ? value : current?.[position]),
  );
