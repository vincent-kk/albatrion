import type { SchemaNodeRendererProps } from '@lumy/schema-form/types';

export const FallbackFormatError: SchemaNodeRendererProps['formatError'] = (
  error,
) => {
  return <em>{error.message}</em>;
};
