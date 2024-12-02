import { Flex, Typography } from 'antd';

import {
  type FormTypeRendererProps,
  isBranchNode,
} from '@lumy-pack/schema-form';

export const FormGroup = ({
  node,
  depth,
  path,
  name,
  Input,
  errorMessage,
}: FormTypeRendererProps) => {
  if (depth === 0) return <Input />;

  if (isBranchNode(node)) {
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
            </label>
          )}
          <Input />
        </Flex>
        <Typography.Text type="danger" style={{ marginLeft: 5 }}>
          {errorMessage}
        </Typography.Text>
      </div>
    );
  }
};
