import type { FormTypeRendererProps } from '@lumy/schema-form/types';

export const FormGroupRenderer = ({
  depth,
  path,
  name,
  Input,
  errorMessage,
}: FormTypeRendererProps) =>
  depth ? (
    <div>
      <label htmlFor={path}>{name}</label>
      <Input />
      <br />
      <em>{errorMessage}</em>
    </div>
  ) : (
    <Input />
  );
