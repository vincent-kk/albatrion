import { memo, useCallback } from 'react';

import type { FormTypeInputProps } from '@lumy/schema-form/types';

function DeleteButton({
  index,
  onClick,
}: {
  index: number;
  onClick: (index: number) => void;
}) {
  return (
    <button
      title="remove item"
      onClick={() => {
        onClick(index);
      }}
    >
      항목 삭제
    </button>
  );
}

export const FormTypeInputArray = memo(
  ({ node, childNodes, readOnly }: FormTypeInputProps<any[]>) => {
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
      <div>
        {childNodes &&
          childNodes.map((Node: any, i: number) => {
            return (
              <div key={Node.key} style={{ border: '1px dashed black' }}>
                <Node />
                {!readOnly && (
                  <DeleteButton index={i} onClick={handleRemoveClick} />
                )}
              </div>
            );
          })}
        <hr />
        {!readOnly && (
          <button title="add item" onClick={handleClick}>
            항목 추가
          </button>
        )}
      </div>
    );
  },
);
