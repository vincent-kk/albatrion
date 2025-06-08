import type { FormTypeRendererProps } from '@/schema-form/types';

export const FormErrorRenderer = ({ errorMessage }: FormTypeRendererProps) => (
  <em>{errorMessage}</em>
);
