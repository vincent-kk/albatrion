import type { BaseFieldRendererProps } from '@/schema-form/types';

export const FormErrorRenderer = ({ errorMessage }: BaseFieldRendererProps) => (
  <em>{errorMessage}</em>
);
