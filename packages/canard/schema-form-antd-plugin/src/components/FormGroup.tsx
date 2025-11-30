import { Flex, Typography } from 'antd';

import { isArraySchema } from '@winglet/json-schema/filter';

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

  if (node.group === 'branch') {
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
          {node.parentNode && isArraySchema(node.parentNode) === false && (
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
        <Typography.Text type="danger">{errorMessage}</Typography.Text>
      </div>
    );
  }
};
