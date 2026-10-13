import { Typography } from 'antd';

import type { FieldRendererProps } from '@canard/schema-form';

export const FormError = ({ errorMessage }: FieldRendererProps) => (
  <Typography.Text type="danger" style={{ wordBreak: 'unset' }}>
    {errorMessage}
  </Typography.Text>
);
