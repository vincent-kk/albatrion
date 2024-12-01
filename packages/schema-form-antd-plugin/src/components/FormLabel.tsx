import { Typography } from 'antd';

import type { FormTypeRendererProps } from '@lumy-pack/schema-form';

const { Text } = Typography;

export const FormLabel = ({ name, path }: FormTypeRendererProps) => {
  return (
    <label htmlFor={path}>
      <Text>{name}</Text>
    </label>
  );
};
