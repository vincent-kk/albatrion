import { type CSSProperties, type MouseEventHandler, type ReactElement, memo, useCallback } from 'react';

import type {
  FormTypeInputDefinition,
  FormTypeInputProps,
} from '@/schema-form/types';

/** Forward list-affecting props while each child retains its own value subscription. */
const FormTypeInputArray = ({ node, jsonSchema, readOnly, disabled,
  ChildNodeComponents, style }: FormTypeInputProps<any[]>) => (
  <ArrayItems node={node} jsonSchema={jsonSchema} readOnly={readOnly}
    disabled={disabled} ChildNodeComponents={ChildNodeComponents} style={style}
    childCount={node.children?.length ?? 0} />
);

/** Rebuild rows only when their identity, structure or presentation changes. */
const ArrayItems = memo(function ArrayItems({
  node,
  jsonSchema,
  readOnly,
  disabled,
  ChildNodeComponents,
  style,
  childCount,
}: Pick<FormTypeInputProps<any[]>, 'node' | 'jsonSchema' | 'readOnly' |
  'disabled' | 'ChildNodeComponents' | 'style'> & { childCount: number }) {
  const handleClick = useCallback(() => {
    node.push();
  }, [node]);
  /** Remove the clicked row; React supplies its button, and direct sibling order is the array index. */
  const handleRemoveClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const row = event.currentTarget.parentElement!;
      node.remove(Array.prototype.indexOf.call(row.parentElement!.children, row));
    },
    [node],
  );
  const rows: ReactElement[] = [];
  for (let index = 0; ChildNodeComponents && index < ChildNodeComponents.length; index++) {
    const ChildNodeComponent = ChildNodeComponents[index];
    const key = ChildNodeComponent.key;
    rows.push(
      <div key={key} style={{ display: 'flex' }}>
        <ChildNodeComponent key={key} />
        {!readOnly && (
          <Button title="remove item" label="x" disabled={disabled}
            index={index} onClick={handleRemoveClick} />
        )}
      </div>,
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, ...style }}>
      {rows}
      {!readOnly &&
        (jsonSchema.maxItems ?? Infinity) > childCount && (
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

export const FormTypeInputArrayDefinition = {
  Component: FormTypeInputArray,
  test: { type: 'array' },
} satisfies FormTypeInputDefinition;
