import {
  type CSSProperties,
  type ReactElement,
  memo,
  useCallback,
  useLayoutEffect,
  useRef,
} from 'react';

import type { Nullable } from '@aileron/declare';

import { FOCUS_SELECTOR } from '@/schema-form/constants/focus';
import type { FieldInputProps } from '@/schema-form/types';

import { fillArraySlot } from '../utils/fillArraySlot';
import { readSlotKind } from '../utils/readSlotKind';
import { Button } from './Button';
import { EmptySlot } from './EmptySlot';

/**
 * One array row: the item, then its remove button on the item's first text line.
 * Top alignment would pin the button to a fieldset's legend line; centring drifts it towards the next item.
 */
const ROW_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 5,
};

/** Keeps the add button at its own width in the column list instead of stretching to the full row. */
const ADD_BUTTON_STYLE: CSSProperties = { alignSelf: 'flex-start' };

/** Rebuild rows only when their identity, structure or presentation changes. */
export const ArrayItems = memo(function ArrayItems({
  node,
  jsonSchema,
  readOnly,
  disabled,
  ChildFields,
  style,
  onChange,
  childCount,
}: Pick<
  FieldInputProps<any[]>,
  | 'node'
  | 'jsonSchema'
  | 'readOnly'
  | 'disabled'
  | 'ChildFields'
  | 'style'
  | 'onChange'
> & { childCount: number }) {
  const handleClick = useCallback(() => {
    node.push();
  }, [node]);
  /** Remove the clicked row; React supplies its button, and direct sibling order is the array index. */
  const handleRemoveClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const row = event.currentTarget.parentElement!;
      node.remove(
        Array.prototype.indexOf.call(row.parentElement!.children, row),
      );
    },
    [node],
  );
  const container = useRef<HTMLDivElement>(null);
  const focusRow = useRef<Nullable<number>>(null);
  /** Write a slot position as input, then let the commit that mounts its row take focus. */
  const handleSlotWrite = useCallback(
    (index: number, value: unknown) => {
      focusRow.current = index;
      onChange(fillArraySlot(node.value, index, value));
    },
    [node, onChange],
  );
  useLayoutEffect(() => {
    if (focusRow.current === null || focusRow.current >= childCount) return;
    const row = container.current?.children[focusRow.current];
    focusRow.current = null;
    row?.querySelector<HTMLElement>(FOCUS_SELECTOR)?.focus();
  });
  const rows: ReactElement[] = [];
  for (let index = 0; ChildFields && index < ChildFields.length; index++) {
    const ChildField = ChildFields[index];
    const key = ChildField.key;
    rows.push(
      <div key={key} style={ROW_STYLE}>
        <ChildField key={key} />
        {!readOnly && (
          <Button
            title="remove item"
            label="Remove"
            disabled={disabled}
            index={index}
            onClick={handleRemoveClick}
          />
        )}
      </div>,
    );
  }
  const slotEnd = Math.min(
    jsonSchema.minItems ?? 0,
    jsonSchema.maxItems ?? Infinity,
  );
  for (let index = childCount; index < slotEnd; index++)
    rows.push(
      <EmptySlot
        key={'slot:' + index}
        index={index}
        kind={readSlotKind(
          jsonSchema,
          index,
          node.find('./' + index)?.jsonSchema,
        )}
        readOnly={readOnly}
        disabled={disabled}
        onWrite={handleSlotWrite}
      />,
    );
  return (
    <div
      ref={container}
      style={{ display: 'flex', flexDirection: 'column', gap: 5, ...style }}
    >
      {rows}
      {!readOnly && (jsonSchema.maxItems ?? Infinity) > childCount && (
        <Button
          title="add item"
          label="Add item"
          disabled={disabled}
          onClick={handleClick}
          style={ADD_BUTTON_STYLE}
        />
      )}
    </div>
  );
});
