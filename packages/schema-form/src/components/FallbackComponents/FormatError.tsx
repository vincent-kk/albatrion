import type { FormTypeRendererProps } from '@lumy/schema-form/types';

export const FormatError: FormTypeRendererProps['formatError'] = (error) => {
  return <em>{error.message}</em>;
};
