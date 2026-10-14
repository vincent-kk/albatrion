import { type ChangeEvent, memo } from 'react';

import type { SlotKind } from '../utils/readSlotKind';

/**
 * Draw one empty array position that holds no node and writes only when the user acts on it.
 * @param props.index - Array position the slot stands for.
 * @param props.kind - Control chosen from the position's schema.
 * @param props.onWrite - Shared writer; receives the position and the converted value.
 * @returns A row with an uncontrolled input, or a fill button for non-primitive positions.
 */
export const EmptySlot = memo(function EmptySlot({
  index,
  kind,
  readOnly,
  disabled,
  onWrite,
}: {
  index: number;
  kind: SlotKind;
  readOnly?: boolean;
  disabled?: boolean;
  onWrite: (index: number, value: unknown) => void;
}) {
  if (kind === 'fill')
    return (
      <div style={{ display: 'flex' }}>
        <button
          type="button"
          title="fill item"
          disabled={disabled || readOnly}
          onClick={() => onWrite(index, undefined)}
        >
          +
        </button>
      </div>
    );
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = readSlotInput(kind, event.currentTarget);
    if (!readOnly && value !== undefined) onWrite(index, value);
  };
  return (
    <div style={{ display: 'flex' }}>
      <input
        type={kind}
        readOnly={readOnly}
        disabled={disabled || (readOnly && kind === 'checkbox')}
        onChange={handleChange}
      />
    </div>
  );
});

/** Convert a slot input to the value it writes; `undefined` means nothing to write yet. */
const readSlotInput = (kind: SlotKind, input: HTMLInputElement) => {
  if (kind === 'checkbox') return input.checked;
  if (kind === 'text') return input.value || undefined;
  const number = input.value.trim() === '' ? NaN : Number(input.value);
  return Number.isFinite(number) ? number : undefined;
};
