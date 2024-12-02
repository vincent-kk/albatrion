import { Typography } from 'antd';

import type { FormTypeRendererProps } from '@lumy-pack/schema-form';

export const FormLabel = ({ name, path }: FormTypeRendererProps) => {
  return (
    <label htmlFor={path}>
      <Typography.Text>{name}</Typography.Text>
    </label>
  );
};
