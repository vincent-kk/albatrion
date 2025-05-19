import { type CSSProperties, useCallback } from 'react';

import { map } from '@winglet/common-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputProps,
} from '@/schema-form/types';

const FormTypeInputArray = ({
  node,
  ChildNodes,
  readOnly,
  disabled,
  style,
}: FormTypeInputProps<any[]>) => {
  const handleClick = useCallback(() => {
    node.push();
  }, [node]);
  const handleRemoveClick = useCallback(
    (index: number) => {
      node.remove(index);
    },
    [node],
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, ...style }}>
      {ChildNodes &&
        map(ChildNodes, (Node, i) => {
          return (
            <div key={Node.key} style={{ display: 'flex' }}>
              <Node />
              {!readOnly && (
                <Button
                  title="remove item"
                  label="x"
                  disabled={disabled}
                  onClick={() => handleRemoveClick(i)}
                />
              )}
            </div>
          );
        })}
      {!readOnly && (
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
            style={{ fontSize: '1rem' }}
          />
        </label>
      )}
    </div>
  );
};

function Button({
  title,
  label,
  disabled,
  onClick,
  style,
}: {
  title: string;
  label: string;
  disabled?: boolean;
  onClick: () => void;
  style?: CSSProperties;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '1.3rem',
        height: '1.3rem',
        fontSize: '0.8rem',
        fontWeight: 'normal',
        border: 'none',
        cursor: 'pointer',
        borderRadius: '50%',
        paddingInline: 'unset',
        paddingBlock: 'unset',
        ...style,
      }}
    >
      {label}
    </button>
  );
}

export const FormTypeInputArrayDefinition = {
  Component: FormTypeInputArray,
  test: { type: 'array' },
} satisfies FormTypeInputDefinition;
