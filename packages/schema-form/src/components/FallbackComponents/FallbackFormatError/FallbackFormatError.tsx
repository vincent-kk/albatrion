import type { FormTypeRendererProps } from '@lumy/schema-form/types';

export const FallbackFormatError: FormTypeRendererProps['formatError'] = (
  error,
) => {
  return <em>{error.message}</em>;
};
