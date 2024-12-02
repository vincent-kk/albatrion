import { Typography } from 'antd';

import type { FormTypeRendererProps } from '@lumy-pack/schema-form';

export const FormError = ({ errorMessage }: FormTypeRendererProps) => {
  return (
    <Typography.Text type="danger" style={{ marginLeft: 5 }}>
      {errorMessage}
    </Typography.Text>
  );
};
