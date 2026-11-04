import type { FieldRendererProps } from '@/schema-form/types';

export const FormErrorRenderer = ({ errorMessage }: FieldRendererProps) => (
  <em>{errorMessage}</em>
);
