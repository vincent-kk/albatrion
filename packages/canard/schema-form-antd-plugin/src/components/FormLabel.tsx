import { Typography } from 'antd';

import type { FormTypeRendererProps } from '@canard/schema-form';

export const FormLabel = ({ name, path, required }: FormTypeRendererProps) => (
  <label htmlFor={path}>
    {required && (
      <Typography.Text type="danger" style={{ marginRight: 4 }}>
        *
      </Typography.Text>
    )}
    <Typography.Text>{name}</Typography.Text>
  </label>
);
