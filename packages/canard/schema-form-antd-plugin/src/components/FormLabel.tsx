import { Typography } from 'antd';

import type { FormTypeRendererProps } from '@canard/schema-form';

export const FormLabel = ({ name, path }: FormTypeRendererProps) => {
  return (
    <label htmlFor={path}>
      <Typography.Text>{name}</Typography.Text>
    </label>
  );
};
