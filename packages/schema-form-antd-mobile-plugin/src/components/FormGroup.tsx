import { Space } from 'antd-mobile';

import type { FormTypeRendererProps } from '@lumy-pack/schema-form';

export const FormGroup = ({
  node,
  depth,
  path,
  name,
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
      <Space direction="vertical">
        <Input />
      </Space>
    );
  } else {
    return (
      <Space direction="vertical">
        {node.parentNode?.type !== 'array' && (
          <label htmlFor={path}>{name}</label>
        )}
        <Input />
        {errorMessage}
      </Space>
    );
  }
};
