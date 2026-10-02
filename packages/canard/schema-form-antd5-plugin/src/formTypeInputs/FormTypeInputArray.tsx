import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, type ButtonProps } from 'antd';

import { map } from '@winglet/common-utils/array';
import { isArray } from '@winglet/common-utils/filter';
import { minLite } from '@winglet/common-utils/math';
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
  jsonSchema,
  node,
  readOnly,
  disabled,
  ChildNodeComponents,
  style,
}: FormTypeInputProps<any[]>) => {
  const maxItems = minLite(
    typeof jsonSchema.maxItems === 'number' ? jsonSchema.maxItems : Infinity,
    !jsonSchema.items && isArray(jsonSchema.prefixItems)
      ? jsonSchema.prefixItems.length
      : Infinity,
  );
  const length = node.children?.length ?? node.value?.length ?? 0;
  const handleClick = useHandle(() => {
    node.push();
  });
  const handleRemoveClick = useHandle((index: number) => {
    node.remove(index);
  });
  return (
    <div style={style}>
      {ChildNodeComponents &&
        map(ChildNodeComponents, (ChildNodeComponent, i) => {
          const key = ChildNodeComponent.key;
          return (
            <div key={key} style={{ display: 'flex' }}>
              <ChildNodeComponent key={key} />
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

      {!readOnly && maxItems > length && (
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
