import { Typography } from 'antd';

import type { JsonSchemaError } from '@lumy-pack/schema-form';

export const formatError = (error: JsonSchemaError) => {
  return <Typography.Text type="danger">{error.message}</Typography.Text>;
};
