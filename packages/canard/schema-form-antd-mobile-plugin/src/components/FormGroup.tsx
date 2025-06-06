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

  if (node.group === 'branch') {
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
              {name}
              {required && (
                <span style={{ marginLeft: 4, color: 'red' }}>*</span>
              )}
            </label>
          )}
          <Input />
        </div>
        {errorMessage}
      </Space>
    );
  }
};
