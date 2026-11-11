import type { FieldRendererProps } from '@/schema-form/types';

export const ErrorMessageRenderer = ({ errorMessage }: FieldRendererProps) => (
  <em>{errorMessage}</em>
);
