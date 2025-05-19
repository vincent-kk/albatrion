import type { FormTypeRendererProps } from '@canard/schema-form';

export const FormLabel = ({ name, path, required }: FormTypeRendererProps) => (
  <label htmlFor={path}>
    {required && <span style={{ marginRight: 4, color: 'red' }}>*</span>}
    {name}
  </label>
);
