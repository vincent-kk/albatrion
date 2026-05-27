import { Typography } from 'antd';

import type { FormTypeRendererProps } from '@canard/schema-form';

export const FormError = ({ errorMessage }: FormTypeRendererProps) => (
  <Typography.Text type="danger" style={{ wordBreak: 'unset' }}>
    {errorMessage}
  </Typography.Text>
);
