import type { FormTypeRendererProps } from '@lumy/schema-form/types';

export const FormGroupRenderer = ({
  name,
  Input,
  errorMessage,
}: FormTypeRendererProps) => (
  <div>
    <label>
      <span>{name}</span>
      <Input />
    </label>
    <br />
    <em>{errorMessage}</em>
  </div>
);
