import { Space } from 'antd-mobile';

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
      <Space direction="vertical" block>
        <Input />
      </Space>
    );
  } else {
    return (
      <Space direction="vertical" block>
        <div>
          {node.parentNode?.type !== 'array' && (
            <label htmlFor={path}>
              {required && (
                <span style={{ marginRight: 4, color: 'red' }}>*</span>
              )}
              {name}
            </label>
          )}
          <Input />
        </div>
        {errorMessage}
      </Space>
    );
  }
};
