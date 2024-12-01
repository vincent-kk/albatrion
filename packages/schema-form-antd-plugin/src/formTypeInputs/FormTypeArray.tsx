import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, type ButtonProps } from 'antd';

import { useHandle } from '@lumy-pack/common-react';
import type {
  FormTypeInputDefinition,
  FormTypeInputProps,
} from '@lumy-pack/schema-form';

const Add = (props: ButtonProps) => (
  <Button type="dashed" icon={<PlusOutlined />} {...props}>
    Add
  </Button>
);

const Remove = (props: ButtonProps) => (
  <Button type="link" icon={<MinusCircleOutlined />} {...props} />
);

const FormTypeArray = ({
  node,
  childNodes,
  readOnly,
  disabled,
}: FormTypeInputProps<any[]>) => {
  const handleClick = useHandle(() => {
    node.push();
  });
  const handleRemoveClick = useHandle((index: number) => {
    node.remove(index);
  });
  return (
    <div>
      {childNodes &&
        childNodes.map((Node, i) => {
          return (
            <div key={Node.key}>
              <Node />
              {!readOnly && (
                <Remove
                  title="remove"
                  disabled={disabled}
                  onClick={() => handleRemoveClick(i)}
                />
              )}
            </div>
          );
        })}
      {!readOnly && (
        <Add title="add" disabled={disabled} onClick={handleClick} />
      )}
    </div>
  );
};

export const FormTypeArrayDefinition = {
  Component: FormTypeArray,
  test: {
    type: 'array',
  },
} satisfies FormTypeInputDefinition;
