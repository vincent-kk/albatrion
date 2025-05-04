import type { FormTypeRendererProps } from '@canard/schema-form';

export const FormLabel = ({ name, path }: FormTypeRendererProps) => (
  <label htmlFor={path}>{name}</label>
);
