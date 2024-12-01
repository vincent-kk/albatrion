import { Typography } from 'antd';

import type { FormTypeRendererProps } from '@lumy-pack/schema-form';

const { Text } = Typography;

export const FormError = ({ errorMessage }: FormTypeRendererProps) => {
  return <Text type="danger">{errorMessage}</Text>;
};
