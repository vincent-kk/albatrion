import { Flex, Typography } from 'antd';

import type { FormTypeRendererProps } from '@canard/schema-form';

export const FormGroup = ({
  node,
  depth,
  path,
  name,
  required,
  Input,
  errorMessage,
}: FormTypeRendererProps) => {
  if (depth === 0) return <Input />;

  if (
    node.type === 'object' ||
    node.type === 'array' ||
    node.type === 'virtual'
  ) {
    return (
      <fieldset
        style={{
          marginBottom: 5,
          marginLeft: 5 * depth,
        }}
      >
        <legend>
          <Typography.Text>{name}</Typography.Text>
        </legend>
        <Input />
      </fieldset>
    );
  } else {
    return (
      <div
        style={{
          marginBottom: 5,
          marginLeft: 5 * depth,
        }}
      >
        <Flex gap={10} align="center">
          {node.parentNode?.type !== 'array' && (
            <label htmlFor={path}>
              <Typography.Text>{name}</Typography.Text>
              {required && (
                <Typography.Text type="danger" style={{ marginLeft: 4 }}>
                  *
                </Typography.Text>
              )}
            </label>
          )}
          <Input />
        </Flex>
        {errorMessage}
      </div>
    );
  }
};
