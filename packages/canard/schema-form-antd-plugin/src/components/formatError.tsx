import { Typography } from 'antd';

import type { JsonSchemaError } from '@canard/schema-form';

export const formatError = (error: JsonSchemaError) => (
  <Typography.Text type="danger">{error.message}</Typography.Text>
);
