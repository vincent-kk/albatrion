import { Typography } from 'antd';

import type { JsonSchemaError } from '@canard/schema-form';

export const formatError = (error: JsonSchemaError) => {
  return <Typography.Text type="danger">{error.message}</Typography.Text>;
};
