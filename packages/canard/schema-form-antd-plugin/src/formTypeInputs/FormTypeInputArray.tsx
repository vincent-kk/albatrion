import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, type ButtonProps } from 'antd';

import { map } from '@winglet/common-utils/array';
import { useHandle } from '@winglet/react-utils/hook';

import type {
  FormTypeInputDefinition,
  FormTypeInputProps,
} from '@canard/schema-form';

const Add = (props: ButtonProps) => (
  <Button type="primary" icon={<PlusOutlined />} {...props}>
    Add
  </Button>
);

const Remove = (props: ButtonProps) => (
  <Button type="link" icon={<MinusCircleOutlined />} {...props} />
);

const FormTypeInputArray = ({
  node,
  readOnly,
  disabled,
  ChildNodeComponents,
  style,
}: FormTypeInputProps<any[]>) => {
  const handleClick = useHandle(() => {
    node.push();
  });
  const handleRemoveClick = useHandle((index: number) => {
    node.remove(index);
  });
  return (
    <div style={style}>
      {ChildNodeComponents &&
        map(ChildNodeComponents, (ChildNodeComponent, i) => (
          <div key={ChildNodeComponent.key} style={{ display: 'flex' }}>
            <ChildNodeComponent />
            {!readOnly && (
              <Remove
                title="remove"
                disabled={disabled}
                onClick={() => handleRemoveClick(i)}
              />
            )}
          </div>
        ))}

      {!readOnly && (
        <div style={{ marginLeft: 20 }}>
          <Add title="add" disabled={disabled} onClick={handleClick} />
        </div>
      )}
    </div>
  );
};

export const FormTypeInputArrayDefinition = {
  Component: FormTypeInputArray,
  test: {
    type: 'array',
  },
} satisfies FormTypeInputDefinition;
