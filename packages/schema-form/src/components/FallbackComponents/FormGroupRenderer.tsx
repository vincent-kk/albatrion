import type { FormTypeRendererProps } from '@lumy/schema-form/types';

export const FormGroupRenderer = ({
  depth,
  path,
  name,
  Input,
  errorMessage,
}: FormTypeRendererProps) =>
  depth ? (
    <div
      style={{
        marginBottom: 5,
        marginLeft: 5 * depth,
      }}
    >
      <label htmlFor={path} style={{ marginRight: 5 }}>
        {name}
      </label>
      <Input />
      <br />
      <em>{errorMessage}</em>
    </div>
  ) : (
    <Input />
  );
