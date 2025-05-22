import type { FormTypeRendererProps } from '@canard/schema-form';

export const FormLabel = ({ name, path, required }: FormTypeRendererProps) => (
  <label htmlFor={path}>
    {name}
    {required && <span style={{ marginLeft: 4, color: 'red' }}>*</span>}
  </label>
);
