import {
  type CSSProperties,
  type MouseEventHandler,
  type ReactElement,
  memo,
  useCallback,
  useLayoutEffect,
  useRef,
} from 'react';

import type {
  FieldInputDefinition,
  FieldInputProps,
} from '@/schema-form/types';

import { EmptySlot } from './components/EmptySlot';
import { fillArraySlot } from './utils/fillArraySlot';
import { readSlotKind } from './utils/readSlotKind';

/** Forward list-affecting props while each child retains its own value subscription. */
const FieldInputArray = ({
  node,
  jsonSchema,
  readOnly,
  disabled,
  ChildFields,
  style,
  onChange,
}: FieldInputProps<any[]>) => (
  <ArrayItems
    node={node}
    jsonSchema={jsonSchema}
    readOnly={readOnly}
    disabled={disabled}
    ChildFields={ChildFields}
    style={style}
    onChange={onChange}
    childCount={node.children?.length ?? 0}
  />
);

/** Rebuild rows only when their identity, structure or presentation changes. */
const ArrayItems = memo(function ArrayItems({
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
  const focusRow = useRef<number | null>(null);
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
    row?.querySelector<HTMLElement>('input, select, textarea, button')?.focus();
  });
  const rows: ReactElement[] = [];
  for (let index = 0; ChildFields && index < ChildFields.length; index++) {
    const ChildField = ChildFields[index];
    const key = ChildField.key;
    rows.push(
      <div key={key} style={{ display: 'flex' }}>
        <ChildField key={key} />
        {!readOnly && (
          <Button
            title="remove item"
            label="x"
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
        key={`slot:${index}`}
        index={index}
        kind={readSlotKind(jsonSchema, index)}
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
        <label
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            cursor: 'pointer',
            marginBottom: 5,
          }}
        >
          <div style={{ marginRight: 10 }}>Add New Item</div>
          <Button
            title="add item"
            label="+"
            disabled={disabled}
            onClick={handleClick}
            fontSize="1rem"
          />
        </label>
      )}
    </div>
  );
});

/**
 * Render a control only when its presentation, current index or shared handler changes.
 * @param props - Native presentation and shared click handler; index keeps row positions in memo comparisons.
 * @returns The same circular native button, without a per-row callback or hook.
 */
const Button = memo(function Button({
  title,
  label,
  disabled,
  onClick,
  size = '1.3rem',
  fontSize = '0.8rem',
  style,
}: {
  title: string;
  label: string;
  disabled?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
  index?: number;
  size?: CSSProperties['width'];
  fontSize?: CSSProperties['fontSize'];
  style?: CSSProperties;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        position: 'relative',
        width: size,
        height: size,
        padding: 0,
        border: 'none',
        cursor: 'pointer',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <span
        style={{
          fontSize,
          lineHeight: 1,
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {label}
      </span>
    </button>
  );
});

export const FieldInputArrayDefinition = {
  Component: FieldInputArray,
  test: { type: 'array' },
} satisfies FieldInputDefinition;
