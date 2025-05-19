import { Button, type ButtonProps } from 'antd-mobile';

import { map } from '@winglet/common-utils';
import { useHandle } from '@winglet/react-utils';

import type {
  FormTypeInputDefinition,
  FormTypeInputProps,
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

const FormTypeInputArray = ({
  node,
  readOnly,
  disabled,
  ChildComponents,
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
      {ChildComponents &&
        map(ChildComponents, (ChildComponent, i) => (
          <div key={ChildComponent.key} style={{ display: 'flex' }}>
            <ChildComponent />
            {!readOnly && (
              <Remove
                disabled={disabled}
                onClick={() => handleRemoveClick(i)}
              />
            )}
          </div>
        ))}

      {!readOnly && (
        <div>
          <Add disabled={disabled} onClick={handleClick} />
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
