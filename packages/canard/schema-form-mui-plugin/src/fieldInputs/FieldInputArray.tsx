import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Button, type ButtonProps } from '@mui/material';

import { map } from '@winglet/common-utils/array';
import { isArray } from '@winglet/common-utils/filter';
import { minLite } from '@winglet/common-utils/math';
import { useHandle } from '@winglet/react-utils/hook';

import type {
  FieldInputDefinition,
  FieldInputProps,
} from '@canard/schema-form';

const Add = (props: ButtonProps) => (
  <Button color="primary" startIcon={<AddIcon />} {...props}>
    Add
  </Button>
);

const Remove = (props: ButtonProps) => (
  <Button color="primary" startIcon={<DeleteIcon />} {...props} />
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
              <div style={{ flex: 1 }}>
                <ChildField key={key} hideLabel />
              </div>
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

export const FieldInputArrayDefinition = {
  Component: FieldInputArray,
  test: {
    type: 'array',
  },
} satisfies FieldInputDefinition;
