import type { FormTypeRendererProps } from '@lumy/schema-form/types';

export const FormGroupRenderer = ({
  depth,
  name,
  Input,
  errorMessage,
}: FormTypeRendererProps) =>
  depth ? (
    <div>
      <label>
        <span>{name}</span>
        <Input />
      </label>
      <br />
      <em>{errorMessage}</em>
    </div>
  ) : (
    <Input />
  );
