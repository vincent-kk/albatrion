import { Typography } from 'antd';

import type { FormTypeRendererProps } from '@canard/schema-form';

export const FormLabel = ({ name, path, required }: FormTypeRendererProps) => (
  <label htmlFor={path}>
    <Typography.Text>{name}</Typography.Text>
    {required && (
      <Typography.Text type="danger" style={{ marginLeft: 4 }}>
        *
      </Typography.Text>
    )}
  </label>
);
