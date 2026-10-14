import { Typography } from 'antd';

import type { FieldRendererProps } from '@canard/schema-form';

export const FormLabel = ({ name, path, required }: FieldRendererProps) => (
  <label htmlFor={path}>
    <Typography.Text style={{ wordBreak: 'unset' }}>{name}</Typography.Text>
    {required && (
      <Typography.Text type="danger" style={{ marginLeft: 4 }}>
        *
      </Typography.Text>
    )}
  </label>
);
