import { Button, type ButtonProps } from 'antd-mobile';

import { map } from '@winglet/common-utils/array';
import { isArray } from '@winglet/common-utils/filter';
import { minLite } from '@winglet/common-utils/math';
import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputProps,
} from '@canard/schema-form';

const Add = (props: ButtonProps) => (
  <div>
    <Button size="mini" {...props}>
      +
    </Button>
  </div>
);

const Remove = (props: ButtonProps) => (
  <div>
    <Button size="mini" {...props}>
      -
    </Button>
  </div>
);

const FieldInputArray = ({
  jsonSchema,
  node,
  readOnly,
  disabled,
  ChildFields,
  style,
}: FieldInputProps<any[]>) => {
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
      {ChildFields &&
        map(ChildFields, (ChildField, i) => {
          const key = ChildField.key;
          return (
            <div key={key} style={{ display: 'flex' }}>
              <ChildField key={key} />
              {!readOnly && (
                <Remove
                  disabled={disabled}
                  onClick={() => handleRemoveClick(i)}
                />
              )}
            </div>
          );
        })}

      {!readOnly && maxItems > length && (
        <div>
          <Add disabled={disabled} onClick={handleClick} />
        </div>
      )}
    </div>
  );
};

export const FieldInputArrayDefinition = {
  Component: FieldInputArray,
  test: {
    type: 'array',
  },
} satisfies FieldInputDefinition;
