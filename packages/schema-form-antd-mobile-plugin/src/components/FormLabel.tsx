import type { FormTypeRendererProps } from '@lumy-pack/schema-form';

export const FormLabel = ({ name, path }: FormTypeRendererProps) => {
  return <label htmlFor={path}>{name}</label>;
};
